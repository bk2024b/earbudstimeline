// Budget Value Index — distinct from Quality Score.
//
// IMPORTANT: quality_score in EarbudsTimeline measures DATA COMPLETENESS/QA,
// not how good an earbud is. It must therefore never be used as Overall Value.
//
// This first version builds a transparent product utility score from measurable
// catalogue attributes, then converts that score into a relative Value per Dollar
// inside the candidate set. The price is therefore a multiplier, not the ranking
// itself: a more expensive earbud can still win if its utility is materially higher.

function n(value) {
  const x = Number(value);
  return Number.isFinite(x) ? x : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  const x = n(value);
  if (x === null) return null;
  if (max === min) return 50;
  return clamp(((x - min) / (max - min)) * 100);
}

function booleanScore(value) {
  return value === true ? 100 : value === false ? 0 : null;
}

/**
 * Product utility score, independent from price (0–100).
 *
 * We intentionally use only fields that exist in the catalogue today.
 * This is NOT presented as a laboratory or editorial "overall" score.
 */
export function computeBudgetUtilityScore(earbud) {
  const parts = [];

  // Battery: 25 pts. Long per-bud endurance matters most for daily use.
  const battery = normalize(earbud.battery_bud_h, 4, 14);
  if (battery !== null) parts.push([battery, 25]);

  // ANC: 20 pts. ANC availability is useful, but not proof of ANC quality.
  const anc = booleanScore(earbud.anc);
  if (anc !== null) parts.push([anc, 20]);

  // Water resistance: 15 pts. Higher IP ratings are useful for sport/daily use.
  const water = String(earbud.water_rating || '').match(/IP\s*([0-9]+)/i);
  if (water) parts.push([clamp((Number(water[1]) / 8) * 100), 15]);

  // Weight: 15 pts. Lighter is generally a useful objective advantage.
  const weight = n(earbud.weight_g);
  if (weight !== null) parts.push([clamp(100 - ((weight - 3) / 9) * 100), 15]);

  // Case endurance: 10 pts.
  const caseBattery = normalize(earbud.battery_case_h, 12, 50);
  if (caseBattery !== null) parts.push([caseBattery, 10]);

  // Bluetooth generation: 10 pts, parsed conservatively.
  const bt = String(earbud.bluetooth || '').match(/(\d+(?:\.\d+)?)/);
  if (bt) parts.push([clamp(((Number(bt[1]) - 4) / 2) * 100), 10]);

  // Data completeness bonus: 5 pts only for fields relevant to this guide.
  const completeness = [earbud.price, earbud.battery_bud_h, earbud.battery_case_h, earbud.weight_g, earbud.water_rating, earbud.bluetooth]
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '').length / 6 * 100;
  parts.push([completeness, 5]);

  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  if (!totalWeight) return null;
  return Math.round(parts.reduce((sum, [score, weight]) => sum + score * weight, 0) / totalWeight);
}

/**
 * Converts utility into a relative 0–100 Value per Dollar score.
 * The best utility/price ratio in the current candidate set becomes 100.
 */
export function rankByValuePerDollar(models) {
  const scored = models.map((model) => {
    const price = n(model.price);
    const utility = computeBudgetUtilityScore(model);
    if (price === null || price <= 0 || utility === null) {
      return { model, utility_score: utility, value_per_dollar: null };
    }
    return { model, utility_score: utility, raw_value_ratio: utility / price };
  });

  const ratios = scored.map((x) => x.raw_value_ratio).filter((x) => Number.isFinite(x));
  const maxRatio = ratios.length ? Math.max(...ratios) : 0;

  return scored.map((x) => ({
    ...x,
    value_per_dollar: Number.isFinite(x.raw_value_ratio) && maxRatio > 0
      ? Math.round((x.raw_value_ratio / maxRatio) * 100)
      : null,
  }));
}
