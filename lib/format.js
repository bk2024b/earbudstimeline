const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
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
