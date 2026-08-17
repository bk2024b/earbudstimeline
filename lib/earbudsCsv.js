import { slugify } from './slug';
import { computeQualityScore } from './qualityScore';

// Colonnes historiques (obligatoires pour la validation ci-dessous — inchangé).
export const CSV_COLUMNS = [
  'id',
  'brand_id',
  'gamme',
  'name',
  'tagline',
  'tagline_en',
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
  'usb_c',
  'multipoint',
  'codec',
  'buy_url',
];

// Colonnes DATA V1 — toutes optionnelles, ajoutées par la migration du standard
// DATA V1. Absentes du CSV = simplement laissées vides ; l'import historique
// (gabarit ecouteurs-modele.csv) continue de fonctionner sans elles.
export const CSV_COLUMNS_DATA_V1 = [
  'family',
  'generation',
  'variant',
  'announcement_date',
  'status',
  'type',
  'transparency',
  'codecs',
  'charging_time_h',
  'wireless_charging',
  'microphones',
  'spatial_audio',
  'ecosystem',
  'app',
  'source_primary',
  'source_secondary',
  'source_checked_at',
  'data_confidence',
  'notes',
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

  // DATA V1 — champs optionnels. codecs accepte soit une colonne dédiée
  // (séparée par des virgules, ex. "AAC, LDAC"), soit repli sur `codec`.
  const codecsRaw = get('codecs') || get('codec');
  const codecs = codecsRaw && codecsRaw !== '—'
    ? codecsRaw.split(',').map((c) => c.trim()).filter(Boolean)
    : null;

  const announcement_date = get('announcement_date');
  if (announcement_date && !DATE_RE.test(announcement_date)) {
    errors.push('announcement_date doit être au format AAAA-MM-JJ');
  }
  const source_checked_at = get('source_checked_at');
  if (source_checked_at && !DATE_RE.test(source_checked_at)) {
    errors.push('source_checked_at doit être au format AAAA-MM-JJ');
  }

  const charging_time_h = parseNum(raw.charging_time_h);
  if (charging_time_h === undefined) errors.push('charging_time_h invalide (nombre attendu)');

  const data = {
    brand_id,
    gamme,
    name,
    tagline,
    tagline_en: get('tagline_en') || null,
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
    usb_c: parseBool(raw.usb_c),
    multipoint: parseBool(raw.multipoint),
    codec: get('codec') || '—',
    buy_url: get('buy_url') || null,

    // DATA V1
    family: get('family') || null,
    generation: get('generation') || null,
    variant: get('variant') || null,
    announcement_date: announcement_date || null,
    status: get('status') || 'released',
    type: get('type') || null,
    transparency: parseBool(raw.transparency),
    codecs,
    charging_time_h: charging_time_h ?? null,
    wireless_charging: parseBool(raw.wireless_charging),
    microphones: get('microphones') || null,
    spatial_audio: parseBool(raw.spatial_audio),
    ecosystem: get('ecosystem') || null,
    app: get('app') || null,
    image_count: 0,
    source_primary: get('source_primary') || null,
    source_secondary: get('source_secondary') || null,
    source_checked_at: source_checked_at || null,
    data_confidence: get('data_confidence') || null,
    notes: get('notes') || null,
  };

  const { quality_score, qa_status } = computeQualityScore(data);
  data.quality_score = quality_score;
  data.qa_status = qa_status;

  return { id, name, isDuplicate, errors, data };
}

/**
 * Valide une ligne de CSV de liens d'achat (format compact: id, buy_url).
 */
export function validateBuyLinkRow(raw, { existingIds = [] } = {}) {
  const errors = [];
  const get = (key) => (raw[key] ?? '').toString().trim();
  const id = get('id');
  const buy_url = get('buy_url') || get('url') || get('link') || get('affiliate_url');

  if (!id) errors.push('ID écouteur manquant');
  else if (existingIds.length > 0 && !existingIds.includes(id)) {
    errors.push(`Écouteur "${id}" introuvable en base`);
  }

  if (!buy_url) errors.push('Lien d\'achat (buy_url) manquant');

  return {
    id,
    buy_url,
    errors,
    isValid: errors.length === 0,
  };
}
