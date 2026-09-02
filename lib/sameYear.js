// Modèles sortis la même année qu'un modèle donné, hors lui-même. Filtre
// pur sur un tableau déjà en mémoire (comme lineagePosition/getPredecessor
// dans lib/evolution.js) — jamais de fetch : la page appelante doit déjà
// avoir chargé `allModels` via getAllEarbuds().
export function getModelsByYear(allModels, year, excludeId, { limit = 4 } = {}) {
  if (!allModels || !year) return [];
  return allModels
    .filter((m) => m.id !== excludeId && new Date(m.release_date).getFullYear() === year)
    // Les modèles marquants d'abord, puis les plus récents dans l'année
    .sort((a, b) => (b.marquant ? 1 : 0) - (a.marquant ? 1 : 0) || b.release_date.localeCompare(a.release_date))
    .slice(0, limit);
}
