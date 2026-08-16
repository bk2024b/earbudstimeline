// key = colonne earbuds, unit = symbole (pas de texte à traduire), decimals = arrondi affiché.
// Le libellé affiché (label) est résolu via les traductions dans EvolutionChart, pas ici.
export const EVOLUTION_METRICS = {
  autonomie: { key: 'battery_case_h', unit: 'h', decimals: 1 },
  poids: { key: 'weight_g', unit: 'g', decimals: 1 },
  bluetooth: { key: 'bluetooth', unit: '', decimals: 1, parse: parseFloat },
  prix: { key: 'price', unit: '$', decimals: 0, onlyPresent: true },
};

// Moyenne d'un champ numérique par année de sortie, triée chronologiquement.
// `onlyPresent` ignore les modèles où le champ est vide/0 plutôt que de fausser la moyenne vers 0.
export function computeYearlySeries(models, metricKey, { onlyPresent, parse } = {}) {
  const byYear = new Map();

  for (const m of models) {
    const raw = m[metricKey];
    const value = parse ? parse(raw) : Number(raw);
    if (Number.isNaN(value)) continue;
    if (onlyPresent && !raw) continue;

    const year = new Date(m.release_date).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(value);
  }

  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, values]) => ({
      year,
      value: values.reduce((s, v) => s + v, 0) / values.length,
    }));
}

/**
 * Retrouve le modèle directement précédent dans la même gamme
 */
export function getPredecessor(gammeModels, modelId) {
  if (!gammeModels || gammeModels.length === 0) return null;
  const sorted = [...gammeModels].sort((a, b) => a.release_date.localeCompare(b.release_date));
  const idx = sorted.findIndex((m) => m.id === modelId);
  return idx > 0 ? sorted[idx - 1] : null;
}

