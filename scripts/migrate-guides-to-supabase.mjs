// One-shot migration: reads the current GUIDE_PAGES array from
// lib/guidePages.js and generates SQL INSERT statements for the new
// `guides` table (see supabase/migrations/202608310001_add_guides_table.sql).
//
// Run once locally:
//   node scripts/migrate-guides-to-supabase.mjs > supabase/generated-guides-seed.sql
// Then run the generated file in the Supabase SQL Editor, same as
// schema.sql / seed.sql.
//
// filter/sort logic in lib/guidePages.js is plain JS closures, which cannot
// be safely introspected automatically. The FILTER_OVERRIDES / SORT_OVERRIDES
// maps below are a hand-written declarative translation of every distinct
// filter/sort pattern that exists in guidePages.js today (verified against
// `grep -n "filter:\|sort:" lib/guidePages.js`). Copy text (title,
// description, intro, sections) is NOT hand-transcribed — it is read
// directly off the GUIDE_PAGES objects to avoid any risk of retyping errors.
//
// If you add a guide to lib/guidePages.js before running this script, add
// its filter/sort translation here too, or it will fall back to "no
// filter, no sort" (safe default: shows the full catalog, unsorted).

import { GUIDE_PAGES } from '../lib/guidePages.js';

export const FILTER_OVERRIDES = {
  'best-gaming-earbuds-under-100': { clauses: [{ field: 'price', op: 'lte', value: 100 }] },
  'nothing-ear-reviews': { clauses: [{ field: 'brand_id', op: 'eq', value: 'nothing' }] },
  'best-earbuds-with-multipoint': { clauses: [{ field: 'multipoint', op: 'eq', value: true }] },
  'best-usb-c-earbuds': { clauses: [{ field: 'usb_c', op: 'eq', value: true }] },
  'best-wireless-charging-earbuds': { clauses: [{ field: 'wireless_charging', op: 'eq', value: true }] },
  'best-transparency-mode-earbuds': { clauses: [{ field: 'transparency', op: 'eq', value: true }] },
  'best-earbuds-with-spatial-audio': { clauses: [{ field: 'spatial_audio', op: 'eq', value: true }] },
  'best-premium-earbuds': { clauses: [{ field: 'price', op: 'gt', value: 200 }] },
  'most-waterproof-earbuds': { clauses: [{ field: 'water_rating', op: 'regex', value: 'X7|X8|57|58|67|68', flags: 'i' }] },
  'best-bluetooth-5-3-earbuds': { clauses: [{ field: 'bluetooth', op: 'eq', value: '5.3' }] },
  'sony-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'sony' }] },
  'sony-vs-apple': { clauses: [{ field: 'brand_id', op: 'in', value: ['apple', 'sony'] }] },
  'google-pixel-buds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'google' }] },
  'jbl-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'jbl' }] },
  'skullcandy-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'skullcandy' }] },
  'xiaomi-redmi-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'xiaomi-redmi' }] },
  'soundcore-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'soundcore' }] },
  'oppo-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'oppo' }] },
  'jabra-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'jabra' }] },
  'oneplus-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'oneplus' }] },
  'audio-technica-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'audio-technica' }] },
  'huawei-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'huawei' }] },
  'sennheiser-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'sennheiser' }] },
  'technics-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'technics' }] },
  'beats-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'beats' }] },
  'shokz-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'shokz' }] },
  'bose-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'bose' }] },
  'samsung-earbuds-guide': { clauses: [{ field: 'brand_id', op: 'eq', value: 'samsung' }] },
  'bose-vs-sony': { clauses: [{ field: 'brand_id', op: 'in', value: ['bose', 'sony'] }] },
  'beats-vs-airpods': { clauses: [{ field: 'brand_id', op: 'in', value: ['beats', 'apple'] }] },
  'jbl-vs-soundcore': { clauses: [{ field: 'brand_id', op: 'in', value: ['jbl', 'soundcore'] }] },
  'jabra-vs-bose': { clauses: [{ field: 'brand_id', op: 'in', value: ['jabra', 'bose'] }] },
  'huawei-vs-samsung': { clauses: [{ field: 'brand_id', op: 'in', value: ['huawei', 'samsung'] }] },
  'best-earbuds-for-office': { clauses: [{ field: 'transparency', op: 'eq', value: true }] },
  'earbuds-with-fastest-charging': { clauses: [{ field: 'charging_time_h', op: 'gt', value: 0 }] },
  'best-earbuds-2025': { clauses: [{ field: 'release_date', op: 'between', value: ['2025-01-01', '2026-01-01'] }] },
  'best-earbuds-with-best-microphone': { clauses: [{ field: 'microphones', op: 'gte', value: 2 }] },
  'best-earbuds-for-video-meetings': { clauses: [{ field: 'multipoint', op: 'eq', value: true }, { field: 'microphones', op: 'gte', value: 1 }] },
  'best-earbuds-with-ldac-aptx': { clauses: [{ named: 'hasHiResCodec' }] },
  // Guides added this session (earbud sound quality topic):
  'ear-buds-on-sale': { clauses: [{ field: 'price', op: 'gt', value: 0 }] },
  'best-open-ear-earbuds': { clauses: [{ named: 'isOpenEarType' }] },
  // best-headphones, bluetooth-earbuds-for-tv-watching, colored-earbuds,
  // different-types-of-earbuds, and airpods-vs-galaxy-buds (Apple + Samsung
  // handled below) intentionally have no filter -> whole catalog.
};

// airpods-vs-galaxy-buds is Apple + Samsung but reads slightly differently in
// source (separate `filter:` line, not the `brand:` shorthand) — same result.
FILTER_OVERRIDES['airpods-vs-galaxy-buds'] = { clauses: [{ field: 'brand_id', op: 'in', value: ['apple', 'samsung'] }] };

const BY_RELEASE_DATE_DESC = [{ field: 'release_date', type: 'date', direction: 'desc' }];
const BY_BATTERY_DESC = [{ field: 'battery_bud_h', type: 'number', direction: 'desc' }];
const BY_MARQUANT_DESC = [{ field: 'marquant', type: 'number', direction: 'desc' }];

export const SORT_OVERRIDES = {
  'best-earbuds-for-gaming-pc': [{ field: 'bluetooth', type: 'number', direction: 'desc' }],
  'best-gaming-earbuds-under-100': [{ field: 'price', type: 'number', direction: 'asc' }],
  'best-sport-earbuds': [{ field: 'water_rating', type: 'string', direction: 'desc' }, { field: 'weight_g', type: 'number', direction: 'asc' }],
  'earbuds-with-longest-battery-life': BY_BATTERY_DESC,
  'airpods-vs-galaxy-buds': BY_RELEASE_DATE_DESC,
  'nothing-ear-reviews': BY_RELEASE_DATE_DESC,
  'best-earbuds-with-multipoint': BY_BATTERY_DESC,
  'best-usb-c-earbuds': BY_RELEASE_DATE_DESC,
  'best-wireless-charging-earbuds': BY_BATTERY_DESC,
  'best-transparency-mode-earbuds': BY_BATTERY_DESC,
  'best-earbuds-with-spatial-audio': BY_RELEASE_DATE_DESC,
  'best-premium-earbuds': [{ field: 'price', type: 'number', direction: 'desc' }],
  'most-waterproof-earbuds': [{ field: 'water_rating', type: 'string', direction: 'desc' }],
  'lightest-wireless-earbuds': [{ field: 'weight_g', type: 'number', direction: 'asc' }],
  'best-bluetooth-5-3-earbuds': BY_RELEASE_DATE_DESC,
  'newest-wireless-earbuds': BY_RELEASE_DATE_DESC,
  'sony-earbuds-guide': BY_RELEASE_DATE_DESC,
  'sony-vs-apple': BY_RELEASE_DATE_DESC,
  'google-pixel-buds-guide': BY_RELEASE_DATE_DESC,
  'jbl-earbuds-guide': BY_RELEASE_DATE_DESC,
  'skullcandy-earbuds-guide': BY_RELEASE_DATE_DESC,
  'xiaomi-redmi-earbuds-guide': BY_RELEASE_DATE_DESC,
  'soundcore-earbuds-guide': BY_RELEASE_DATE_DESC,
  'oppo-earbuds-guide': BY_RELEASE_DATE_DESC,
  'jabra-earbuds-guide': BY_RELEASE_DATE_DESC,
  'oneplus-earbuds-guide': BY_RELEASE_DATE_DESC,
  'audio-technica-earbuds-guide': BY_RELEASE_DATE_DESC,
  'huawei-earbuds-guide': BY_RELEASE_DATE_DESC,
  'sennheiser-earbuds-guide': BY_RELEASE_DATE_DESC,
  'technics-earbuds-guide': BY_RELEASE_DATE_DESC,
  'beats-earbuds-guide': BY_RELEASE_DATE_DESC,
  'shokz-earbuds-guide': BY_RELEASE_DATE_DESC,
  'bose-earbuds-guide': BY_RELEASE_DATE_DESC,
  'samsung-earbuds-guide': BY_RELEASE_DATE_DESC,
  'bose-vs-sony': BY_RELEASE_DATE_DESC,
  'beats-vs-airpods': BY_RELEASE_DATE_DESC,
  'jbl-vs-soundcore': BY_RELEASE_DATE_DESC,
  'jabra-vs-bose': BY_RELEASE_DATE_DESC,
  'huawei-vs-samsung': BY_RELEASE_DATE_DESC,
  'best-earbuds-for-office': BY_BATTERY_DESC,
  'earbuds-with-fastest-charging': [{ field: 'charging_time_h', type: 'number', direction: 'asc' }],
  'earbuds-with-longest-case-battery': [{ field: 'battery_case_h', type: 'number', direction: 'desc' }],
  'best-earbuds-2025': BY_RELEASE_DATE_DESC,
  'best-earbuds-with-best-microphone': [{ field: 'microphones', type: 'number', direction: 'desc' }, { field: 'battery_bud_h', type: 'number', direction: 'desc' }],
  'best-earbuds-for-video-meetings': [{ field: 'battery_bud_h', type: 'number', direction: 'desc' }, { field: 'microphones', type: 'number', direction: 'desc' }],
  'best-earbuds-with-ldac-aptx': BY_BATTERY_DESC,
  // Guides added this session:
  'best-headphones': [{ field: 'marquant', type: 'number', direction: 'desc' }, { field: 'anc', type: 'number', direction: 'desc' }, { field: 'battery_bud_h', type: 'number', direction: 'desc' }],
  'ear-buds-on-sale': [{ field: 'price', type: 'number', direction: 'asc' }],
  'best-open-ear-earbuds': BY_BATTERY_DESC,
  'bluetooth-earbuds-for-tv-watching': [{ computed: 'hasLowLatencyCodec', direction: 'desc' }, { field: 'battery_bud_h', type: 'number', direction: 'desc' }],
  'colored-earbuds': BY_MARQUANT_DESC,
  'different-types-of-earbuds': BY_MARQUANT_DESC,
};

export const RENDER_VARIANT = {
  'best-noise-cancelling-earbuds': 'anc',
  'best-budget-earbuds': 'budget',
};

function sqlString(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJsonb(value) {
  if (value == null) return 'NULL';
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

const rows = GUIDE_PAGES.map((guide) => {
  const filter = guide.brand
    ? { clauses: [{ field: 'brand_id', op: 'eq', value: guide.brand }] }
    : (FILTER_OVERRIDES[guide.slug] || null);
  const sort = SORT_OVERRIDES[guide.slug] || [];
  const variant = RENDER_VARIANT[guide.slug] || 'standard';

  return `insert into guides (slug, priority, title_en, description_en, intro_en, sections_en, title_fr, description_fr, intro_fr, sections_fr, filter, sort, render_variant) values (
  ${sqlString(guide.slug)}, ${guide.priority ?? 0.75},
  ${sqlString(guide.en.title)}, ${sqlString(guide.en.description)}, ${sqlString(guide.en.intro)}, ${sqlJsonb(guide.en.sections)},
  ${sqlString(guide.fr.title)}, ${sqlString(guide.fr.description)}, ${sqlString(guide.fr.intro)}, ${sqlJsonb(guide.fr.sections)},
  ${sqlJsonb(filter)}, ${sqlJsonb(sort)}, ${sqlString(variant)}
) on conflict (slug) do update set
  priority = excluded.priority,
  title_en = excluded.title_en, description_en = excluded.description_en, intro_en = excluded.intro_en, sections_en = excluded.sections_en,
  title_fr = excluded.title_fr, description_fr = excluded.description_fr, intro_fr = excluded.intro_fr, sections_fr = excluded.sections_fr,
  filter = excluded.filter, sort = excluded.sort, render_variant = excluded.render_variant, updated_at = now();`;
});

console.log('-- Generated by scripts/migrate-guides-to-supabase.mjs — do not hand-edit, re-run instead.');
console.log(`-- ${GUIDE_PAGES.length} guides converted from lib/guidePages.js.\n`);
console.log(rows.join('\n\n'));
