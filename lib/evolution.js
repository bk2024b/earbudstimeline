// key = colonne earbuds, unit = symbole (pas de texte à traduire), decimals = arrondi affiché.
// Le libellé affiché (label) est résolu via les traductions dans EvolutionChart, pas ici.
// key = colonne earbuds, unit = symbole (pas de texte à traduire), decimals = arrondi affiché.
// Le libellé affiché (label) est résolu via les traductions dans EvolutionChart, pas ici.
// isRate + boolKey : métrique de taux d'adoption (%) d'une caractéristique
// booléenne, calculée différemment (computeYearlyAdoptionRate) d'une moyenne
// numérique classique (computeYearlySeries).
export const EVOLUTION_METRICS = {
  autonomie: { key: 'battery_case_h', unit: 'h', decimals: 1 },
  poids: { key: 'weight_g', unit: 'g', decimals: 1 },
  bluetooth: { key: 'bluetooth', unit: '', decimals: 1, parse: parseFloat },
  prix: { key: 'price', unit: '$', decimals: 0, onlyPresent: true },
  anc: { boolKey: 'anc', unit: '%', decimals: 0, isRate: true },
  multipoint: { boolKey: 'multipoint', unit: '%', decimals: 0, isRate: true },
  usbC: { boolKey: 'usb_c', unit: '%', decimals: 0, isRate: true },
  wirelessCharging: { boolKey: 'wireless_charging', unit: '%', decimals: 0, isRate: true },
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

// Part (%) des modèles ayant une caractéristique booléenne (ex. ANC), par
// année de sortie. Distinct de computeYearlySeries : ici on compte des
// occurrences plutôt que de moyenner un nombre.
export function computeYearlyAdoptionRate(models, boolKey) {
  const byYear = new Map();

  for (const m of models) {
    const year = new Date(m.release_date).getFullYear();
    if (!byYear.has(year)) byYear.set(year, { total: 0, withFeature: 0 });
    const entry = byYear.get(year);
    entry.total += 1;
    if (m[boolKey]) entry.withFeature += 1;
  }

  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, { total, withFeature }]) => ({
      year,
      value: total > 0 ? (withFeature / total) * 100 : 0,
    }));
}

// Calcule une série (voir computeYearlySeries/computeYearlyAdoptionRate) par
// marque plutôt que globalement — pour un graphe multi-marques superposées.
// Retourne une Map<brand_id, [{year, value}]>, une entrée par marque ayant
// au moins un point de donnée pour cette métrique.
export function computeYearlySeriesByBrand(models, metric) {
  const byBrand = new Map();
  for (const m of models) {
    if (!byBrand.has(m.brand_id)) byBrand.set(m.brand_id, []);
    byBrand.get(m.brand_id).push(m);
  }

  const result = new Map();
  for (const [brandId, brandModels] of byBrand) {
    const series = metric.isRate
      ? computeYearlyAdoptionRate(brandModels, metric.boolKey)
      : computeYearlySeries(brandModels, metric.key, { onlyPresent: metric.onlyPresent, parse: metric.parse });
    if (series.length > 0) result.set(brandId, series);
  }
  return result;
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

