// Budget Value Engine
// -------------------
// Value per Dollar is intentionally separate from the site's data-quality score.
// It answers: "How much product utility do I get for each dollar spent?"
//
// Performance scores are preferred when available. Specification fallbacks are
// used only for dimensions for which no performance score exists. Missing data is
// NOT converted to zero: weights are redistributed across available dimensions.

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  const n = num(value);
  if (n === null) return null;
  if (max === min) return 50;
  return clamp(((n - min) / (max - min)) * 100);
}

function firstNumber(obj, keys) {
  for (const key of keys) {
    const value = num(obj?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function performance(obj, keys) {
  const value = firstNumber(obj, keys);
  return value === null ? null : clamp(value);
}

function batteryFallback(earbud) {
  return normalize(firstNumber(earbud, ['battery_bud_h', 'battery_hours']), 4, 14);
}

function durabilityFallback(earbud) {
  const match = String(earbud?.water_rating || '').match(/IP\s*([0-9]+)/i);
  return match ? clamp((Number(match[1]) / 8) * 100) : null;
}

/**
 * Product utility, independent of price.
 * Target weights: Sound 30, ANC 20, Calls 15, Comfort 15,
 * Battery 10, Durability 5, Features 5.
 *
 * NULL scores are omitted and the remaining weights are redistributed.
 */
export function computeBudgetUtilityScore(earbud) {
  const dimensions = [
    ['sound', 30, performance(earbud, ['sound_score', 'soundScore', 'sound', 'sound_rating'])],
    ['anc', 20, performance(earbud, ['anc_score', 'ancScore', 'anc'])],
    ['calls', 15, performance(earbud, ['calls_score', 'call_score', 'callsScore', 'calls'])],
    ['comfort', 15, performance(earbud, ['comfort_score', 'comfortScore', 'comfort'])],
    ['battery', 10, batteryFallback(earbud)],
    ['durability', 5, durabilityFallback(earbud)],
    ['features', 5, performance(earbud, ['features_score', 'feature_score', 'featuresScore'])],
  ];

  const available = dimensions.filter(([, , score]) => score !== null);
  if (!available.length) return null;

  const totalWeight = available.reduce((sum, [, weight]) => sum + weight, 0);
  const weightedScore = available.reduce((sum, [, weight, score]) => sum + score * weight, 0);
  return Math.round(weightedScore / totalWeight);
}

/**
 * Value per Dollar = Utility / Price.
 * The best ratio in the candidate set is normalized to 100.
 */
export function rankByValuePerDollar(models) {
  const scored = models.map((model) => {
    const price = num(model?.price);
    const utility = computeBudgetUtilityScore(model);

    if (price === null || price <= 0 || utility === null) {
      return { model, utility_score: utility, raw_value_ratio: null, value_per_dollar: null };
    }

    return { model, utility_score: utility, raw_value_ratio: utility / price, value_per_dollar: null };
  });

  const ratios = scored.map((x) => x.raw_value_ratio).filter(Number.isFinite);
  const maxRatio = ratios.length ? Math.max(...ratios) : 0;

  return scored
    .map((x) => ({
      ...x,
      value_per_dollar: Number.isFinite(x.raw_value_ratio) && maxRatio > 0
        ? Math.round((x.raw_value_ratio / maxRatio) * 100)
        : null,
    }))
    .sort((a, b) => {
      if (a.value_per_dollar === null) return 1;
      if (b.value_per_dollar === null) return -1;
      return b.value_per_dollar - a.value_per_dollar;
    });
}
