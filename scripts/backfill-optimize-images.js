#!/usr/bin/env node
// scripts/backfill-optimize-images.js
//
// Backfill : optimise les images déjà en base (uploadées avant que le
// pipeline côté client — lib/clientImageOptimization.js — n'existe ou avant
// qu'il ne couvre tous les chemins d'upload). Reproduit la même logique
// (resize 1600px max, WebP qualité 82 → 55 par paliers, cible ≤500 Ko) mais
// côté serveur avec `sharp`, puisqu'il n'y a pas de Canvas/DOM en Node.
//
// Couvre trois sources :
//   - earbuds.image_url
//   - articles.cover_image_url
//   - les <img src="..."> inline dans articles.content_html
//
// Usage :
//   npm install --save-dev sharp   (une fois)
//   node scripts/backfill-optimize-images.js --dry-run          # rapport seul, rien n'est modifié
//   node scripts/backfill-optimize-images.js                    # exécution réelle
//   node scripts/backfill-optimize-images.js --table=earbuds    # limiter à une table
//   node scripts/backfill-optimize-images.js --limit=20         # limiter le nombre de lignes (tests)
//   node scripts/backfill-optimize-images.js --delete-old       # supprime aussi l'ancien fichier du bucket
//
// Nécessite les mêmes variables d'env que l'app : NEXT_PUBLIC_SUPABASE_URL
// et SUPABASE_SERVICE_ROLE_KEY (voir env.local.example / lib/supabaseAdmin.js).
// Ne touche à AUCUNE ligne dont l'image n'est pas hébergée sur le bucket
// Supabase du projet (URL externe → ignorée, jamais retéléchargée).

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

// `next dev`/`next build` chargent .env.local automatiquement ; un simple
// `node scripts/...` ne le fait pas. @next/env est fourni avec la
// dépendance `next` déjà présente dans le projet — on réutilise le même
// chargeur que Next.js en interne, avec la même précédence de fichiers
// (.env.local > .env.production/.env.development > .env), pour ne pas
// dupliquer de logique ni ajouter de dépendance.
require('@next/env').loadEnvConfig(path.resolve(__dirname, '..'));

const BUCKET = 'media';
const MAX_DIMENSION = 1600;
const START_QUALITY = 82;
const MIN_QUALITY = 55;
const QUALITY_STEP = 8;
const MAX_OUTPUT_BYTES = 500 * 1024;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DELETE_OLD = args.includes('--delete-old');
const TABLE_FILTER = args.find((a) => a.startsWith('--table='))?.split('=')[1] || null;
const LIMIT = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1]) || null;
// Petite limite de concurrence pour ne pas saturer l'API Storage/Postgres de Supabase.
const CONCURRENCY = Number(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1]) || 4;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✖ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont introuvables.');
  console.error('  Vérifiez qu\'un fichier .env.local (pas juste .env.local.example) existe à la racine du projet et contient ces deux variables.');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;

const stats = { scanned: 0, optimized: 0, skippedExternal: 0, skippedAlreadyOptimal: 0, skippedNoGain: 0, failed: 0, bytesBefore: 0, bytesAfter: 0 };
// Cache par URL source → { url: nouvelle URL publique, storagePath: ancien chemin } pour ne
// traiter qu'une seule fois une même image référencée plusieurs fois (ex. réutilisée dans
// deux articles), et pour appliquer le même remplacement partout où elle apparaît.
const urlCache = new Map();

function isOwnStorageUrl(url) {
  try {
    const u = new URL(url);
    return u.host === SUPABASE_HOST && u.pathname.includes(`/storage/v1/object/public/${BUCKET}/`);
  } catch {
    return false;
  }
}

function storagePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
}

async function withConcurrency(items, worker, limit) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

// Optimise un fichier déjà téléchargé (Buffer) — resize + WebP dégressif,
// identique à la logique de lib/clientImageOptimization.js.
async function optimizeBuffer(buffer) {
  let quality = START_QUALITY;
  let output = await sharp(buffer)
    .rotate() // applique l'orientation EXIF puis la retire (équivalent imageOrientation: 'from-image')
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  while (output.length > MAX_OUTPUT_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    output = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }
  return output;
}

// Télécharge, optimise, ré-uploade une URL Supabase Storage, met le cache à
// jour. Retourne la nouvelle URL publique (ou l'URL d'origine si inchangée).
async function processImageUrl(sourceUrl, folderHint) {
  if (urlCache.has(sourceUrl)) return urlCache.get(sourceUrl).url;

  stats.scanned += 1;

  if (!isOwnStorageUrl(sourceUrl)) {
    stats.skippedExternal += 1;
    urlCache.set(sourceUrl, { url: sourceUrl });
    return sourceUrl;
  }

  const oldPath = storagePathFromUrl(sourceUrl);
  if (!oldPath) {
    stats.skippedExternal += 1;
    urlCache.set(sourceUrl, { url: sourceUrl });
    return sourceUrl;
  }

  // Déjà un petit WebP produit par le pipeline client (voir seuils dans
  // lib/clientImageOptimization.js) → rien à gagner à le retraiter.
  if (oldPath.endsWith('.webp')) {
    const { data: head } = await supabase.storage.from(BUCKET).list(oldPath.split('/').slice(0, -1).join('/'), {
      search: oldPath.split('/').pop(),
    });
    const meta = head?.[0];
    if (meta?.metadata?.size && meta.metadata.size <= MAX_OUTPUT_BYTES) {
      stats.skippedAlreadyOptimal += 1;
      urlCache.set(sourceUrl, { url: sourceUrl });
      return sourceUrl;
    }
  }

  try {
    const { data: downloaded, error: dlError } = await supabase.storage.from(BUCKET).download(oldPath);
    if (dlError) throw dlError;
    const originalBuffer = Buffer.from(await downloaded.arrayBuffer());

    const optimizedBuffer = await optimizeBuffer(originalBuffer);

    if (optimizedBuffer.length >= originalBuffer.length) {
      stats.skippedNoGain += 1;
      urlCache.set(sourceUrl, { url: sourceUrl });
      return sourceUrl;
    }

    const folder = folderHint || oldPath.split('/').slice(0, -1).join('/') || 'misc';
    const newPath = `${folder}/${crypto.randomUUID()}.webp`;

    stats.bytesBefore += originalBuffer.length;
    stats.bytesAfter += optimizedBuffer.length;
    stats.optimized += 1;

    if (DRY_RUN) {
      const pct = Math.round((1 - optimizedBuffer.length / originalBuffer.length) * 100);
      console.log(`[dry-run] ${oldPath} : ${(originalBuffer.length / 1024).toFixed(0)} Ko → ${(optimizedBuffer.length / 1024).toFixed(0)} Ko (−${pct}%)`);
      urlCache.set(sourceUrl, { url: sourceUrl });
      return sourceUrl;
    }

    const { error: upError } = await supabase.storage.from(BUCKET).upload(newPath, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });
    if (upError) throw upError;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
    const newUrl = pub.publicUrl;

    if (DELETE_OLD) {
      const { error: delError } = await supabase.storage.from(BUCKET).remove([oldPath]);
      if (delError) console.warn(`  ⚠ ancien fichier non supprimé (${oldPath}) : ${delError.message}`);
    }

    console.log(`✓ ${oldPath} → ${newPath} (${(originalBuffer.length / 1024).toFixed(0)} Ko → ${(optimizedBuffer.length / 1024).toFixed(0)} Ko)`);
    urlCache.set(sourceUrl, { url: newUrl, storagePath: oldPath });
    return newUrl;
  } catch (err) {
    stats.failed += 1;
    console.error(`✖ échec sur ${oldPath} : ${err.message}`);
    urlCache.set(sourceUrl, { url: sourceUrl });
    return sourceUrl;
  }
}

async function backfillEarbuds() {
  console.log('\n— Table earbuds (image_url) —');
  let query = supabase.from('earbuds').select('id, image_url').not('image_url', 'is', null);
  if (LIMIT) query = query.limit(LIMIT);
  const { data: rows, error } = await query;
  if (error) throw error;

  await withConcurrency(rows, async (row) => {
    const newUrl = await processImageUrl(row.image_url, 'earbuds');
    if (!DRY_RUN && newUrl !== row.image_url) {
      const { error: updError } = await supabase.from('earbuds').update({ image_url: newUrl }).eq('id', row.id);
      if (updError) console.error(`  ✖ maj DB earbuds/${row.id} : ${updError.message}`);
    }
  }, CONCURRENCY);
}

async function backfillArticles() {
  console.log('\n— Table articles (cover_image_url + images inline) —');
  let query = supabase.from('articles').select('id, cover_image_url, content_html');
  if (LIMIT) query = query.limit(LIMIT);
  const { data: rows, error } = await query;
  if (error) throw error;

  await withConcurrency(rows, async (row) => {
    const patch = {};

    if (row.cover_image_url) {
      const newCover = await processImageUrl(row.cover_image_url, 'articles');
      if (newCover !== row.cover_image_url) patch.cover_image_url = newCover;
    }

    if (row.content_html) {
      const imgUrls = [...row.content_html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
      let html = row.content_html;
      for (const src of [...new Set(imgUrls)]) {
        const newSrc = await processImageUrl(src, 'articles-content');
        if (newSrc !== src) html = html.split(src).join(newSrc);
      }
      if (html !== row.content_html) patch.content_html = html;
    }

    if (!DRY_RUN && Object.keys(patch).length > 0) {
      const { error: updError } = await supabase.from('articles').update(patch).eq('id', row.id);
      if (updError) console.error(`  ✖ maj DB articles/${row.id} : ${updError.message}`);
    }
  }, CONCURRENCY);
}

async function main() {
  console.log(`Backfill images ${DRY_RUN ? '(DRY RUN — aucune écriture)' : '(exécution réelle)'}`);
  if (TABLE_FILTER !== 'articles') await backfillEarbuds();
  if (TABLE_FILTER !== 'earbuds') await backfillArticles();

  const savedMb = ((stats.bytesBefore - stats.bytesAfter) / (1024 * 1024)).toFixed(1);
  const pct = stats.bytesBefore > 0 ? Math.round((1 - stats.bytesAfter / stats.bytesBefore) * 100) : 0;
  console.log('\n— Résumé —');
  console.log(`Images vues        : ${stats.scanned}`);
  console.log(`Optimisées${DRY_RUN ? ' (simulé)' : ''}       : ${stats.optimized}`);
  console.log(`Déjà optimales     : ${stats.skippedAlreadyOptimal}`);
  console.log(`Hébergées ailleurs : ${stats.skippedExternal}`);
  console.log(`Aucun gain         : ${stats.skippedNoGain}`);
  console.log(`Échecs             : ${stats.failed}`);
  console.log(`Poids économisé    : ${savedMb} Mo (−${pct}%)`);

  if (DRY_RUN) console.log('\nRelancez sans --dry-run pour appliquer réellement ces changements.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
