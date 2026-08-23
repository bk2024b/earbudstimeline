const MONTHS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

// locale par défaut 'fr' pour ne pas casser les appels existants pendant la migration —
// chaque appelant devrait passer la locale courante explicitement.
export function fmtDate(iso, locale = 'fr') {
  if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '—';
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m) return iso;
  const months = MONTHS[locale] || MONTHS.fr;
  const monthName = months[m - 1] || '';
  return locale === 'en' ? `${monthName} ${d || ''}, ${y}` : `${d || ''} ${monthName} ${y}`.trim();
}

export function yearOf(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const y = Number(iso.split('-')[0]);
  return Number.isFinite(y) ? y : '';
}

export function fmtMoney(v) {
  return v ? `${v} $` : '—';
}

export function fmtH(v) {
  const n = Number(v);
  return `${n % 1 === 0 ? n : n.toFixed(1)} h`;
}

export function fmtG(v) {
  const n = Number(v);
  return `${n % 1 === 0 ? n : n.toFixed(1)} g`;
}

export function pct(cur, base) {
  if (!base) return null;
  return Math.round(((cur - base) / base) * 100);
}

// Accroche à afficher selon la langue : utilise tagline_en si elle existe et
// que la langue est 'en', sinon retombe sur la version française (toujours
// renseignée). Évite qu'un modèle non encore traduit affiche un champ vide.
export function displayTagline(model, locale) {
  return locale === 'en' && model.tagline_en ? model.tagline_en : model.tagline;
}
