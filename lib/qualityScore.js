// Calcul du Quality Score (0-100) selon le standard DATA V1 EarbudsTimeline.
// Pondération reprise telle quelle de la feuille QUALITY_SCORE du standard :
//   Identité 10 · Chronologie 15 · Prix 10 · Audio 15 · Batterie 10
//   Connectivité 10 · Physique 10 · Image 10 · Sources 10  (= 100 pts)
//
// Appelé côté serveur avant chaque insert/update (formulaire admin ET import CSV)
// pour que quality_score / qa_status restent toujours cohérents avec les données
// réellement enregistrées, sans dépendre d'un recalcul manuel.

const THRESHOLDS = [
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

/**
 * data : l'objet earbud tel qu'il sera inséré/mis à jour en base (mêmes clés que la table).
 * Retourne { quality_score, qa_status }.
 */
export function computeQualityScore(data) {
  let score = 0;

  // Identité — 10 pts : marque, gamme, nom cohérents
  if (has(data.brand_id) && has(data.gamme) && has(data.name)) score += 10;

  // Chronologie — 15 pts : date de sortie vérifiée (announcement_date en bonus partiel)
  if (has(data.release_date)) score += has(data.announcement_date) ? 15 : 12;

  // Prix — 10 pts : prix renseigné, ou absence explicitement justifiée (status discontinued/announced)
  if (has(data.price)) score += 10;
  else if (data.status === 'announced') score += 6;

  // Audio — 15 pts : bluetooth + codecs + type + anc documentés
  {
    let audioPts = 0;
    if (has(data.bluetooth)) audioPts += 5;
    if (has(data.codecs) || has(data.codec)) audioPts += 4;
    if (has(data.type)) audioPts += 3;
    if (data.anc === true || data.anc === false) audioPts += 3;
    score += audioPts;
  }

  // Batterie — 10 pts : autonomie écouteurs + boîtier
  if (has(data.battery_bud_h) && has(data.battery_case_h)) score += 10;

  // Connectivité — 10 pts : usb_c / multipoint / recharge sans fil vérifiés
  {
    let connPts = 0;
    if (data.usb_c === true || data.usb_c === false) connPts += 4;
    if (data.multipoint === true || data.multipoint === false) connPts += 3;
    if (data.wireless_charging === true || data.wireless_charging === false) connPts += 3;
    score += connPts;
  }

  // Physique — 10 pts : poids + résistance eau/poussière
  if (has(data.weight_g) && has(data.water_rating)) score += 10;

  // Image — 10 pts : image principale réelle
  if (has(data.image_url)) score += 10;

  // Sources — 10 pts : source primaire + date de vérification
  if (has(data.source_primary) && has(data.source_checked_at)) score += 10;
  else if (has(data.source_primary)) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const qa_status = THRESHOLDS.find((t) => score >= t.min).status;

  return { quality_score: score, qa_status };
}
