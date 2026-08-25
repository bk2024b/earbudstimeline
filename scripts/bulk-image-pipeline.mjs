#!/usr/bin/env node
/**
 * scripts/bulk-image-pipeline.mjs
 * ---------------------------------------------------------------------------
 * Batch pipeline: CSV of {id, image_url} -> download -> rembg (background
 * removal) -> webp optimization (sharp) -> Supabase Storage upload -> DB
 * update on the `earbuds` table -> ISR cache revalidation.
 *
 * Runs entirely outside Vercel/Next.js (plain `node`), so there are no
 * serverless package-size, execution-time, or cold-start constraints — the
 * only external dependency is having `rembg` on your PATH (already the case)
 * and `sharp` installed (`npm install sharp`).
 *
 * USAGE
 *   node scripts/bulk-image-pipeline.mjs path/to/photos.csv
 *   node scripts/bulk-image-pipeline.mjs path/to/photos.csv --dry-run
 *
 * CSV FORMAT (header row required)
 *   id,image_url
 *   app3,https://exemple.com/airpods-pro-3.jpg
 *   gb4,https://exemple.com/galaxy-buds3.jpg
 *
 * REQUIRED ENV (read from .env.local at the project root, or already
 * exported in your shell)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_SESSION_SECRET      (reused as a shared secret to call the
 *                              revalidation endpoint — same value already
 *                              used for the admin cookie)
 *
 * OPTIONAL ENV
 *   SITE_BASE_URL             (default: http://earbudstimeline.com — point this
 *                              at your production URL to revalidate prod)
 * ---------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import Papa from 'papaparse';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// 0. Tiny .env.local loader (no extra dependency; works on any Node >= 18)
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env.local — fine if the vars are already exported in the shell.
  }
}
loadEnvLocal();

// ---------------------------------------------------------------------------
// 1. Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET;
const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://earbudstimeline.com';
const BUCKET = 'media';

const MAX_DIMENSION = 1600;
const START_QUALITY = 82; // sharp webp quality is 0-100, mirrors clientImageOptimization.js (0.82)
const MIN_QUALITY = 55;
const QUALITY_STEP = 8;
const MAX_BYTES = 500 * 1024;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// 2. CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--'));
const isDryRun = args.includes('--dry-run');

if (!csvPath) {
  console.error('Usage: node scripts/bulk-image-pipeline.mjs <photos.csv> [--dry-run]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Quality score — mirrors lib/qualityScore.js so admin stays consistent.
//    Kept as a local copy because this script runs as plain ESM outside the
//    Next.js build, and lib/qualityScore.js is authored for that pipeline.
//    If lib/qualityScore.js weighting changes, mirror the change here too.
// ---------------------------------------------------------------------------
const QUALITY_THRESHOLDS = [
  { min: 90, status: 'VERIFIED' },
  { min: 75, status: 'GOOD' },
  { min: 50, status: 'INCOMPLETE' },
  { min: 0, status: 'NEEDS_RESEARCH' },
];

function has(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '' && v.trim() !== '—';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function computeQualityScore(data) {
  let score = 0;
  if (has(data.brand_id) && has(data.gamme) && has(data.name)) score += 10;
  score += has(data.release_date) ? (has(data.announcement_date) ? 15 : 12) : 0;
  if (has(data.price)) score += 10;
  else if (data.status === 'announced') score += 6;
  {
    let audioPts = 0;
    if (has(data.bluetooth)) audioPts += 5;
    if (has(data.codecs) || has(data.codec)) audioPts += 4;
    if (has(data.type)) audioPts += 3;
    if (data.anc === true || data.anc === false) audioPts += 3;
    score += audioPts;
  }
  if (has(data.battery_bud_h) && has(data.battery_case_h)) score += 10;
  {
    let connPts = 0;
    if (data.usb_c === true || data.usb_c === false) connPts += 4;
    if (data.multipoint === true || data.multipoint === false) connPts += 3;
    if (data.wireless_charging === true || data.wireless_charging === false) connPts += 3;
    score += connPts;
  }
  if (has(data.weight_g) && has(data.water_rating)) score += 10;
  if (has(data.image_url)) score += 10;
  if (has(data.source_primary) && has(data.source_checked_at)) score += 10;
  else if (has(data.source_primary)) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const qa_status = QUALITY_THRESHOLDS.find((t) => score >= t.min).status;
  return { quality_score: score, qa_status };
}

// ---------------------------------------------------------------------------
// 4. Pipeline steps
// ---------------------------------------------------------------------------
async function downloadImage(url, workDir) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (HTTP ${res.status})`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error(`URL did not return an image (content-type: ${contentType || 'unknown'})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const urlExt = extname(new URL(url).pathname).toLowerCase();
  const ext = ['.jpg', '.jpeg', '.png', '.webp'].includes(urlExt) ? urlExt : '.jpg';
  const rawPath = join(workDir, `raw${ext}`);
  writeFileSync(rawPath, buffer);
  return rawPath;
}

function removeBackground(rawPath, workDir) {
  const outPath = join(workDir, 'cutout.png');
  try {
    execFileSync('rembg', ['i', rawPath, outPath], { stdio: 'pipe' });
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error('rembg not found on PATH — activate the venv/environment where it is installed');
    }
    throw new Error(`rembg failed: ${e.stderr?.toString().slice(0, 200) || e.message}`);
  }
  return outPath;
}

async function optimizeToWebp(pngPath) {
  let quality = START_QUALITY;
  let buffer = await sharp(pngPath)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    buffer = await sharp(pngPath)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }
  return buffer;
}

async function uploadToSupabase(buffer) {
  const path = `earbuds/${randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// 5. Main
// ---------------------------------------------------------------------------
async function main() {
  const csvRaw = readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvRaw, { header: true, skipEmptyLines: true });
  const rows = (parsed.data || []).filter((r) => r.id?.toString().trim());

  if (rows.length === 0) {
    console.error('✗ No valid rows found in the CSV (expected columns: id, image_url).');
    process.exit(1);
  }

  console.log(`${isDryRun ? '[DRY RUN] ' : ''}${rows.length} row(s) to process from ${csvPath}\n`);

  const results = [];
  const processedForRevalidate = [];

  for (const row of rows) {
    const id = row.id.toString().trim();
    const url = row.image_url?.toString().trim();
    const label = `${id}`;

    if (!url) {
      results.push({ id, ok: false, error: 'missing image_url' });
      console.log(`✗ ${label} — missing image_url`);
      continue;
    }

    // Confirm the earbud exists and grab its current row (needed for quality score + brand_id).
    const { data: earbud, error: fetchError } = await supabase.from('earbuds').select('*').eq('id', id).maybeSingle();
    if (fetchError || !earbud) {
      results.push({ id, ok: false, error: fetchError?.message || 'earbud id not found in database' });
      console.log(`✗ ${label} — id not found in earbuds table`);
      continue;
    }

    if (isDryRun) {
      try {
        const head = await fetch(url, { method: 'HEAD' });
        results.push({ id, ok: head.ok, error: head.ok ? null : `URL unreachable (HTTP ${head.status})` });
        console.log(head.ok ? `✓ ${label} — OK (dry run)` : `✗ ${label} — URL unreachable (HTTP ${head.status})`);
      } catch (e) {
        results.push({ id, ok: false, error: e.message });
        console.log(`✗ ${label} — ${e.message}`);
      }
      continue;
    }

    const workDir = mkdtempSync(join(tmpdir(), 'earbuds-img-'));
    try {
      const rawPath = await downloadImage(url, workDir);
      const cutoutPath = removeBackground(rawPath, workDir);
      const webpBuffer = await optimizeToWebp(cutoutPath);
      const image_url = await uploadToSupabase(webpBuffer);

      const merged = { ...earbud, image_url, image_count: 1 };
      const { quality_score, qa_status } = computeQualityScore(merged);

      const { error: updateError } = await supabase
        .from('earbuds')
        .update({ image_url, image_count: 1, quality_score, qa_status })
        .eq('id', id);
      if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

      results.push({ id, ok: true });
      processedForRevalidate.push({ id, brandId: earbud.brand_id });
      console.log(`✓ ${label} — done (${(webpBuffer.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      results.push({ id, ok: false, error: e.message });
      console.log(`✗ ${label} — ${e.message}`);
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n${okCount}/${results.length} succeeded.`);
  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.log('\nFailed rows:');
    failures.forEach((r) => console.log(`  - ${r.id}: ${r.error}`));
  }

  if (isDryRun || processedForRevalidate.length === 0) return;

  if (!ADMIN_SECRET) {
    console.log('\n⚠ ADMIN_SESSION_SECRET not set — skipping cache revalidation. Pages will refresh on their own within the hour (revalidate = 3600), or open /admin and save each edited earbud manually.');
    return;
  }

  try {
    const res = await fetch(`${SITE_BASE_URL}/api/admin/revalidate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
      body: JSON.stringify({ items: processedForRevalidate }),
    });
    if (res.ok) {
      console.log(`\n✓ Cache revalidated for ${processedForRevalidate.length} earbud(s) at ${SITE_BASE_URL}.`);
    } else {
      console.log(`\n⚠ Revalidation call failed (HTTP ${res.status}) — pages will still refresh within the hour.`);
    }
  } catch (e) {
    console.log(`\n⚠ Could not reach ${SITE_BASE_URL} to revalidate (${e.message}) — is the dev/prod server running?`);
  }
}

main().catch((e) => {
  console.error('\nFatal error:', e);
  process.exit(1);
});
