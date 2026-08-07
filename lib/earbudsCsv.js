import { slugify } from './slug';

export const CSV_COLUMNS = [
  'id',
  'brand_id',
  'gamme',
  'name',
  'tagline',
  'release_date',
  'price',
  'marquant',
  'anc',
  'battery_bud_h',
  'battery_case_h',
  'weight_g',
  'water_rating',
  'chip',
  'bluetooth',
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseBool(v) {
  const s = (v ?? '').toString().trim().toLowerCase();
  return ['true', '1', 'oui', 'vrai', 'yes', 'x'].includes(s);
}

// null = vide (autorisé si le champ est optionnel), undefined = présent mais invalide
function parseNum(v) {
  const s = (v ?? '').toString().trim();
  if (s === '') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isNaN(n) ? undefined : n;
}

/**
 * Valide et normalise une ligne brute de CSV (objet clé/valeur issu de papaparse header:true).
 * Ne touche jamais à la base — pur, réutilisable côté client (aperçu) et serveur (garde-fou final).
 */
export function validateCsvRow(raw, { brands, existingIds }) {
  const errors = [];
  const get = (key) => (raw[key] ?? '').toString().trim();

  const brand_id = get('brand_id');
  const name = get('name');
  const gamme = get('gamme');
  const tagline = get('tagline');
  const release_date = get('release_date');
  const water_rating = get('water_rating') || 'Non résistant';
  const chip = get('chip') || '—';
  const bluetooth = get('bluetooth');

  if (!brand_id) errors.push('brand_id manquant');
  else if (!brands.some((b) => b.id === brand_id)) {
    const known = brands.map((b) => JSON.stringify(b.id)).join(', ') || '(aucune)';
    errors.push(`marque ${JSON.stringify(brand_id)} inconnue — connues par ce composant : ${known}`);
  }

  if (!name) errors.push('name manquant');
  if (!gamme) errors.push('gamme manquante');
  if (!tagline) errors.push('tagline manquante');

  if (!release_date) errors.push('release_date manquante');
  else if (!DATE_RE.test(release_date)) errors.push('release_date doit être au format AAAA-MM-JJ');

  if (!bluetooth) errors.push('bluetooth manquant');

  const price = parseNum(raw.price);
  if (price === undefined) errors.push('price invalide (nombre attendu)');

  const battery_bud_h = parseNum(raw.battery_bud_h);
  if (battery_bud_h === undefined) errors.push('battery_bud_h invalide (nombre attendu)');
  else if (battery_bud_h === null) errors.push('battery_bud_h manquant');

  const battery_case_h = parseNum(raw.battery_case_h);
  if (battery_case_h === undefined) errors.push('battery_case_h invalide (nombre attendu)');
  else if (battery_case_h === null) errors.push('battery_case_h manquant');

  const weight_g = parseNum(raw.weight_g);
  if (weight_g === undefined) errors.push('weight_g invalide (nombre attendu)');
  else if (weight_g === null) errors.push('weight_g manquant');

  const idRaw = get('id');
  const id = slugify(idRaw || `${brand_id}-${name}`);
  if (!id) errors.push("id impossible à générer (brand_id et name manquants)");

  const isDuplicate = Boolean(id) && existingIds.includes(id);

  return {
    id,
    name,
    isDuplicate,
    errors,
    data: {
      brand_id,
      gamme,
      name,
      tagline,
      release_date,
      price: price ?? null,
      marquant: parseBool(raw.marquant),
      anc: parseBool(raw.anc),
      battery_bud_h: battery_bud_h ?? null,
      battery_case_h: battery_case_h ?? null,
      weight_g: weight_g ?? null,
      water_rating,
      chip,
      bluetooth,
    },
  };
}
