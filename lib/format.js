const MONTHS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

// locale par défaut 'fr' pour ne pas casser les appels existants pendant la migration —
// chaque appelant devrait passer la locale courante explicitement.
export function fmtDate(iso, locale = 'fr') {
  const [y, m, d] = iso.split('-').map(Number);
  const months = MONTHS[locale] || MONTHS.fr;
  return locale === 'en' ? `${months[m - 1]} ${d}, ${y}` : `${d} ${months[m - 1]} ${y}`;
}

export function yearOf(iso) {
  return Number(iso.split('-')[0]);
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
