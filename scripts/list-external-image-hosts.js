#!/usr/bin/env node
// scripts/list-external-image-hosts.js
//
// One-off : liste les hostnames externes (hors bucket Supabase) référencés
// dans earbuds.image_url, brands.image_url (si la colonne existe) et
// articles.cover_image_url / content_html. Sert à remplir `remotePatterns`
// dans next.config.mjs suite au passage du loader custom (voir
// lib/imageLoader.js) — celui-ci n'a plus le comportement "bypass total" de
// l'ancien `unoptimized: true`, Next revalide chaque src externe contre
// `images.remotePatterns`.
//
// Usage : node scripts/list-external-image-hosts.js

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('@next/env').loadEnvConfig(path.resolve(__dirname, '..'));

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✖ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont introuvables (.env.local).');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

async function main() {
  const hosts = new Map(); // host -> { count, examples: [] }

  function record(url, source) {
    const host = hostOf(url);
    if (!host || host === SUPABASE_HOST) return;
    const entry = hosts.get(host) || { count: 0, examples: [] };
    entry.count += 1;
    if (entry.examples.length < 2) entry.examples.push(`${source}: ${url}`);
    hosts.set(host, entry);
  }

  const { data: earbuds } = await supabase.from('earbuds').select('id, image_url').not('image_url', 'is', null);
  earbuds.forEach((e) => record(e.image_url, `earbuds/${e.id}`));

  const { data: articles } = await supabase.from('articles').select('id, cover_image_url, content_html');
  articles.forEach((a) => {
    if (a.cover_image_url) record(a.cover_image_url, `articles/${a.id} (cover)`);
    [...(a.content_html || '').matchAll(/<img[^>]+src=["']([^"']+)["']/g)].forEach((m) =>
      record(m[1], `articles/${a.id} (contenu)`)
    );
  });

  // brands.image_url n'existe pas dans le schéma actuel (supabase/schema.sql)
  // — si une migration l'a ajouté depuis, ce select échouera silencieusement
  // et sera juste ignoré.
  try {
    const { data: brands } = await supabase.from('brands').select('id, image_url').not('image_url', 'is', null);
    brands?.forEach((b) => record(b.image_url, `brands/${b.id}`));
  } catch {
    // colonne inexistante, rien à faire
  }

  if (hosts.size === 0) {
    console.log('Aucun domaine externe trouvé — toutes les images sont déjà sur le bucket Supabase.');
    return;
  }

  console.log(`${hosts.size} domaine(s) externe(s) trouvé(s) :\n`);
  const sorted = [...hosts.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [host, { count, examples }] of sorted) {
    console.log(`  ${host}  (${count} image${count > 1 ? 's' : ''})`);
    examples.forEach((ex) => console.log(`    - ${ex}`));
  }

  console.log('\n— À coller dans next.config.mjs, section images.remotePatterns —\n');
  console.log(
    sorted
      .map(([host]) => `      { protocol: 'https', hostname: '${host}' },`)
      .join('\n')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
