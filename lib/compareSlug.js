// Slug canonique et stable pour une paire de comparaison : toujours trié
// alphabétiquement par id, pour qu'une seule URL existe par paire
// (évite les doublons a-vs-b / b-vs-a aux yeux des moteurs de recherche).
export function buildComparisonSlug(idA, idB) {
  const [x, y] = [idA, idB].sort();
  return `${x}-vs-${y}`;
}

// Retourne [idA, idB] tels qu'écrits dans le slug, ou null si le format est invalide.
export function parseComparisonSlug(slug) {
  const parts = slug.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts;
}

export function isCanonicalSlug(slug) {
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return false;
  return buildComparisonSlug(parsed[0], parsed[1]) === slug;
}
