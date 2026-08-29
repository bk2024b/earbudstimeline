#!/usr/bin/env node
// scripts/backfill-optimize-images.js
//
// Backfill : optimise les images déjà en base (uploadées avant que le
// pipeline côté client — lib/clientImageOptimization.js — n'existe ou avant
// qu'il ne couvre tous les chemins d'upload). Reproduit la même logique
// (resize 1600px max, WebP qualité 82 → 55 par paliers, cible ≤500 Ko) mais
// côté serveur avec `sharp`, puisqu'il n'y a pas de Canvas/DOM en Node.
//
// Génère aussi, pour chaque image déjà traitée par ce script (nouvelle ou
// ancienne), les variantes responsives manquantes (voir lib/imageVariants.js
// et lib/storage.js — même convention de nommage `<nom>-<largeur>.webp`) :
// c'est ce qui permet au loader Next custom (lib/imageLoader.js) de servir
// une taille adaptée à chaque visiteur plutôt que le fichier 1600px à tout
// le monde. Sûr à relancer plusieurs fois : une variante déjà présente dans
// le bucket n'est jamais régénérée.
//
// Couvre quatre sources :
//   - earbuds.image_url
//   - brands.image_url (logos, components/BrandBadge.js)
//   - articles.cover_image_url
//   - les <img src="..."> inline dans articles.content_html
//
// Usage :
//   npm install --save-dev sharp   (une fois)
//   node scripts/backfill-optimize-images.js --dry-run          # rapport seul, rien n'est modifié
//   node scripts/backfill-optimize-images.js                    # exécution réelle (les 3 tables)
//   node scripts/backfill-optimize-images.js --table=earbuds    # limiter à une table (earbuds|brands|articles)
//   node scripts/backfill-optimize-images.js --table=brands     # ex. juste les logos de marques
//   node scripts/backfill-optimize-images.js --limit=20         # limiter le nombre de lignes (tests)
//   node scripts/backfill-optimize-images.js --delete-old       # supprime aussi l'ancien fichier du bucket
//   node scripts/backfill-optimize-images.js --skip-variants    # ne pas (re)générer les variantes responsives
//   node scripts/backfill-optimize-images.js --migrate-external # rapatrie aussi les images hébergées ailleurs
//
// Nécessite les mêmes variables d'env que l'app : NEXT_PUBLIC_SUPABASE_URL
// et SUPABASE_SERVICE_ROLE_KEY (voir env.local.example / lib/supabaseAdmin.js).
//
// Par défaut, une image dont l'URL n'est pas sur le bucket Supabase du
// projet est ignorée (jamais retéléchargée). Avec --migrate-external, elle
// est retéléchargée depuis sa source (fetch HTTP standard, Node 18+) puis
// migrée vers notre bucket comme les autres — utile pour des images
// générées ailleurs (ex. images.openai.com) et jamais rapatriées après coup :
// exécutez d'abord `node scripts/list-external-image-hosts.js` pour savoir
// combien d'images et quels domaines sont concernés avant de lancer ça.

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
const SKIP_VARIANTS = args.includes('--skip-variants');
// Par défaut, une image hébergée hors de notre bucket (ex. liens de
// génération images.openai.com jamais rapatriés après coup) est ignorée,
// comme avant. Avec ce flag, elle est retéléchargée et migrée vers Supabase
// Storage comme n'importe quelle autre image du catalogue.
const MIGRATE_EXTERNAL = args.includes('--migrate-external');
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

const stats = { scanned: 0, optimized: 0, migratedExternal: 0, skippedExternal: 0, skippedAlreadyOptimal: 0, skippedNoGain: 0, failed: 0, bytesBefore: 0, bytesAfter: 0 };
const variantStats = { created: 0, alreadyPresent: 0, failed: 0 };
// Cache par URL source → { url: nouvelle URL publique, storagePath: ancien chemin } pour ne
// traiter qu'une seule fois une même image référencée plusieurs fois (ex. réutilisée dans
// deux articles), et pour appliquer le même remplacement partout où elle apparaît.
const urlCache = new Map();

// lib/imageVariants.js est en ESM (`export`) alors que ce script tourne en
// CommonJS (exécuté directement via `node`, hors du bundler Next) — on le
// charge donc via un `import()` dynamique plutôt que de dupliquer la
// convention de nommage des variantes ici.
let imageVariants;
async function loadImageVariants() {
  imageVariants = await import('../lib/imageVariants.js');
}

function isOwnStorageUrl(url) {
  return imageVariants.isOwnStorageUrl(url, SUPABASE_HOST);
}

function storagePathFromUrl(url) {
  return imageVariants.storagePathFromUrl(url);
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

// S'assure que chaque variante responsive (lib/imageVariants.VARIANT_WIDTHS)
// existe dans le bucket pour le fichier canonique donné — sans quoi le
// loader Next (lib/imageLoader.js) pointerait vers un fichier absent pour
// toutes les images uploadées avant l'introduction de cette fonctionnalité.
// Idempotent : une variante déjà présente n'est ni retéléchargée ni recréée.
async function ensureVariants(canonicalPath, canonicalBuffer) {
  if (SKIP_VARIANTS) return;

  const dir = canonicalPath.split('/').slice(0, -1).join('/');

  await Promise.all(
    imageVariants.VARIANT_WIDTHS.map(async (width) => {
      const variantPath = imageVariants.variantStoragePath(canonicalPath, width);
      const fileName = variantPath.split('/').pop();

      try {
        const { data: existing } = await supabase.storage.from(BUCKET).list(dir, { search: fileName });
        if (existing?.some((f) => f.name === fileName)) {
          variantStats.alreadyPresent += 1;
          return;
        }

        if (DRY_RUN) {
          console.log(`  [dry-run] variante manquante : ${variantPath}`);
          return;
        }

        const resized = await sharp(canonicalBuffer)
          .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toBuffer();

        const { error } = await supabase.storage.from(BUCKET).upload(variantPath, resized, {
          contentType: 'image/webp',
          upsert: true,
        });
        if (error) throw error;

        variantStats.created += 1;
      } catch (err) {
        variantStats.failed += 1;
        console.error(`  ✖ variante ${variantPath} : ${err.message}`);
      }
    })
  );
}

// Télécharge une image externe (hors bucket Supabase) via fetch — utilisé
// uniquement quand --migrate-external est passé. Contrairement aux fichiers
// déjà dans notre bucket (téléchargés via l'API Storage), ici c'est une vraie
// requête HTTP vers un tiers (ex. images.openai.com pour des illustrations
// générées par IA et jamais rapatriées après génération).
async function downloadExternal(url) {
  if (typeof fetch !== 'function') {
    throw new Error('fetch global indisponible — Node 18+ requis pour --migrate-external');
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Télécharge, optimise, ré-uploade une image, met le cache à jour. Retourne
// la nouvelle URL publique (ou l'URL d'origine si inchangée). Génère aussi
// ses variantes responsives (sauf --skip-variants) avant de retourner, qu'un
// ré-encodage ait eu lieu ou non cette fois-ci.
//
// Deux origines possibles :
//   - déjà sur notre bucket Supabase → retraitée sur place (chemin normal)
//   - hébergée ailleurs (ex. images.openai.com, liens de génération DALL-E
//     jamais rapatriés) → seulement si --migrate-external est passé,
//     retéléchargée puis migrée vers notre bucket comme n'importe quelle
//     autre image. Sans ce flag, comportement inchangé : ignorée.
async function processImageUrl(sourceUrl, folderHint) {
  if (urlCache.has(sourceUrl)) return urlCache.get(sourceUrl).url;

  stats.scanned += 1;

  const isOwn = isOwnStorageUrl(sourceUrl);

  if (!isOwn && !MIGRATE_EXTERNAL) {
    stats.skippedExternal += 1;
    urlCache.set(sourceUrl, { url: sourceUrl });
    return sourceUrl;
  }

  const oldPath = isOwn ? storagePathFromUrl(sourceUrl) : null;
  if (isOwn && !oldPath) {
    stats.skippedExternal += 1;
    urlCache.set(sourceUrl, { url: sourceUrl });
    return sourceUrl;
  }

  // Déjà un petit WebP produit par le pipeline client (voir seuils dans
  // lib/clientImageOptimization.js) → rien à gagner à le retraiter, mais on
  // vérifie quand même ses variantes plus bas. Ne s'applique qu'aux fichiers
  // déjà sur notre bucket — une image externe migrée est toujours ré-encodée,
  // on n'a pas ses métadonnées de taille avant de l'avoir téléchargée.
  let alreadyOptimal = false;
  if (isOwn && oldPath.endsWith('.webp')) {
    const { data: head } = await supabase.storage.from(BUCKET).list(oldPath.split('/').slice(0, -1).join('/'), {
      search: oldPath.split('/').pop(),
    });
    const meta = head?.[0];
    if (meta?.metadata?.size && meta.metadata.size <= MAX_OUTPUT_BYTES) {
      alreadyOptimal = true;
    }
  }

  try {
    let originalBuffer;
    if (isOwn) {
      const { data: downloaded, error: dlError } = await supabase.storage.from(BUCKET).download(oldPath);
      if (dlError) throw dlError;
      originalBuffer = Buffer.from(await downloaded.arrayBuffer());
    } else {
      originalBuffer = await downloadExternal(sourceUrl);
    }

    if (alreadyOptimal) {
      stats.skippedAlreadyOptimal += 1;
      await ensureVariants(oldPath, originalBuffer);
      urlCache.set(sourceUrl, { url: sourceUrl });
      return sourceUrl;
    }

    const optimizedBuffer = await optimizeBuffer(originalBuffer);

    // "Pas de gain" ne s'applique qu'aux fichiers déjà chez nous : dans ce
    // cas on peut se permettre de laisser l'existant tel quel. Pour une
    // image externe migrée, l'objectif n'est pas d'économiser des Ko mais de
    // rapatrier le fichier chez nous — on l'upload donc toujours, même si le
    // ré-encodage webp ne gagne rien (source déjà bien compressée).
    if (isOwn && optimizedBuffer.length >= originalBuffer.length) {
      stats.skippedNoGain += 1;
      await ensureVariants(oldPath, originalBuffer);
      urlCache.set(sourceUrl, { url: sourceUrl });
      return sourceUrl;
    }

    const folder = folderHint || (isOwn ? oldPath.split('/').slice(0, -1).join('/') : null) || 'misc';
    const newPath = `${folder}/${crypto.randomUUID()}.webp`;
    const label = isOwn ? oldPath : sourceUrl;

    stats.bytesBefore += originalBuffer.length;
    stats.bytesAfter += optimizedBuffer.length;
    stats.optimized += 1;
    if (!isOwn) stats.migratedExternal += 1;

    if (DRY_RUN) {
      const pct = Math.round((1 - optimizedBuffer.length / originalBuffer.length) * 100);
      const verb = isOwn ? 'ré-encodage' : 'migration';
      console.log(`[dry-run] (${verb}) ${label} : ${(originalBuffer.length / 1024).toFixed(0)} Ko → ${(optimizedBuffer.length / 1024).toFixed(0)} Ko (${pct >= 0 ? '−' : '+'}${Math.abs(pct)}%)`);
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

    // DELETE_OLD ne concerne que les fichiers qu'on avait déjà sur notre
    // bucket (oldPath) — rien à supprimer chez OpenAI pour une image migrée,
    // ce n'est pas notre fichier.
    if (DELETE_OLD && isOwn) {
      const { error: delError } = await supabase.storage.from(BUCKET).remove([oldPath]);
      if (delError) console.warn(`  ⚠ ancien fichier non supprimé (${oldPath}) : ${delError.message}`);
    }

    console.log(`✓ ${label} → ${newPath} (${(originalBuffer.length / 1024).toFixed(0)} Ko → ${(optimizedBuffer.length / 1024).toFixed(0)} Ko)`);
    await ensureVariants(newPath, optimizedBuffer);
    urlCache.set(sourceUrl, { url: newUrl, storagePath: oldPath });
    return newUrl;
  } catch (err) {
    stats.failed += 1;
    console.error(`✖ échec sur ${isOwn ? oldPath : sourceUrl} : ${err.message}`);
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

// Logos de marques (components/BrandBadge.js). Absents de supabase/schema.sql
// (colonne ajoutée directement en base, jamais reportée dans le fichier local
// — schéma désynchronisé, sans rapport avec ce backfill), d'où l'oubli
// initial de cette table ici : c'était la seule des trois tables avec des
// images (earbuds, articles, brands) jamais couverte par ce script, donc la
// seule dont les logos n'avaient aucune variante générée — c'est ce qui
// cassait leur affichage une fois le loader custom activé (lib/imageLoader.js
// demande une variante ~200px pour ces petits badges, absente du bucket).
async function backfillBrands() {
  console.log('\n— Table brands (image_url) —');
  let query = supabase.from('brands').select('id, image_url').not('image_url', 'is', null);
  if (LIMIT) query = query.limit(LIMIT);
  const { data: rows, error } = await query;
  if (error) {
    console.warn(`  ⚠ table brands ignorée (${error.message}) — colonne image_url absente sur cet environnement ?`);
    return;
  }

  await withConcurrency(rows, async (row) => {
    const newUrl = await processImageUrl(row.image_url, 'brands');
    if (!DRY_RUN && newUrl !== row.image_url) {
      const { error: updError } = await supabase.from('brands').update({ image_url: newUrl }).eq('id', row.id);
      if (updError) console.error(`  ✖ maj DB brands/${row.id} : ${updError.message}`);
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
  await loadImageVariants();

  console.log(`Backfill images ${DRY_RUN ? '(DRY RUN — aucune écriture)' : '(exécution réelle)'}${SKIP_VARIANTS ? ' [variantes désactivées]' : ''}`);
  if (!TABLE_FILTER || TABLE_FILTER === 'earbuds') await backfillEarbuds();
  if (!TABLE_FILTER || TABLE_FILTER === 'brands') await backfillBrands();
  if (!TABLE_FILTER || TABLE_FILTER === 'articles') await backfillArticles();

  const savedMb = ((stats.bytesBefore - stats.bytesAfter) / (1024 * 1024)).toFixed(1);
  const pct = stats.bytesBefore > 0 ? Math.round((1 - stats.bytesAfter / stats.bytesBefore) * 100) : 0;
  console.log('\n— Résumé optimisation —');
  console.log(`Images vues        : ${stats.scanned}`);
  console.log(`Optimisées${DRY_RUN ? ' (simulé)' : ''}       : ${stats.optimized}`);
  if (MIGRATE_EXTERNAL) console.log(`  dont migrées${DRY_RUN ? ' (simulé)' : ''}    : ${stats.migratedExternal}`);
  console.log(`Déjà optimales     : ${stats.skippedAlreadyOptimal}`);
  console.log(`Hébergées ailleurs : ${stats.skippedExternal}${MIGRATE_EXTERNAL ? ' (hors --migrate-external, ex. échecs)' : ' (non migrées, --migrate-external pour les rapatrier)'}`);
  console.log(`Aucun gain         : ${stats.skippedNoGain}`);
  console.log(`Échecs             : ${stats.failed}`);
  console.log(`Poids économisé    : ${savedMb} Mo (−${pct}%)`);

  if (!SKIP_VARIANTS) {
    console.log('\n— Résumé variantes responsives —');
    console.log(`Créées             : ${variantStats.created}`);
    console.log(`Déjà présentes     : ${variantStats.alreadyPresent}`);
    console.log(`Échecs             : ${variantStats.failed}`);
  }

  if (DRY_RUN) console.log('\nRelancez sans --dry-run pour appliquer réellement ces changements.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
