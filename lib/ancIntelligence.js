/**
 * Presentation adapter for the database ANC Intelligence engine.
 *
 * The actual ANC scoring lives in Supabase views/functions:
 *   earbuds_anc_environment_scores -> earbuds_anc_scores
 *
 * This module only combines those persisted scores with the catalog data
 * used by the Finder. It never invents ANC performance when evidence is NULL.
 */

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function weightedAverage(parts) {
  const available = parts.filter((p) => p.value !== null && p.value !== undefined);
  if (!available.length) return null;
  const totalWeight = available.reduce((sum, p) => sum + p.weight, 0);
  return totalWeight ? available.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight : null;
}

export function analyzeEarbudsForBudget(models, brands, ancScores = [], {
  maxBudget = 200,
  priority = 'balanced',
  brandId = 'all',
  locale = 'fr',
} = {}) {
  if (!models?.length) return { winner: null, alternatives: [], totalUnderBudget: 0 };

  const brandMap = Object.fromEntries((brands || []).map((b) => [b.id, b]));
  const ancMap = Object.fromEntries((ancScores || []).map((row) => [row.earbud_id, row]));
  const budgetLimit = maxBudget >= 500 ? Infinity : maxBudget;

  const eligibleModels = models.filter((m) => {
    const price = m.price ?? 150;
    return price <= budgetLimit && (!brandId || brandId === 'all' || m.brand_id === brandId);
  });

  const candidates = eligibleModels.length
    ? eligibleModels
    : [...models].sort((a, b) => (a.price ?? 999) - (b.price ?? 999)).slice(0, 5);

  const scored = candidates.map((m) => {
    const anc = ancMap[m.id] || {};
    const price = m.price ?? 150;
    const year = Number(m.release_date?.slice(0, 4) || 2021);
    const recencyBonus = Math.min(20, Math.max(0, (year - 2018) * 2));
    const totalBattery = (m.battery_bud_h || 5) + (m.battery_case_h || 20);
    const batteryScore = clamp((totalBattery / 36) * 100);
    const water = String(m.water_rating || '').toUpperCase();
    const waterScore = water.match(/X7|X8|57|67|68/) ? 100 : water.match(/54|55|X5/) ? 85 : water.match(/X4|44/) ? 70 : water.match(/X2/) ? 35 : 0;
    const comfortScore = clamp(100 - ((m.weight_g || 5.5) - 4) * 15);
    const btScore = clamp(((parseFloat(m.bluetooth) || 5) - 4.5) * 100);
    const multipointScore = m.multipoint ? 100 : 40;
    const budgetHeadroom = maxBudget >= 500 ? 300 : maxBudget;
    const valueScore = clamp(((budgetHeadroom - price) / budgetHeadroom) * 50 + (m.anc ? 30 : 0) + (totalBattery > 24 ? 20 : 0));

    const travel = anc.anc_travel_score == null ? null : Number(anc.anc_travel_score);
    const office = anc.anc_office_score == null ? null : Number(anc.anc_office_score);
    const traffic = anc.anc_traffic_score == null ? null : Number(anc.anc_traffic_score);
    const voices = anc.anc_voices_score == null ? null : Number(anc.anc_voices_score);
    const evidenceAnc = weightedAverage([
      { value: travel, weight: 0.30 },
      { value: office, weight: 0.25 },
      { value: traffic, weight: 0.25 },
      { value: voices, weight: 0.20 },
    ]);
    const ancScore = anc.anc_score == null ? evidenceAnc : Number(anc.anc_score);
    const coverage = anc.coverage_score == null ? (anc.environment_count ? Number(anc.environment_count) / 4 * 100 : 0) : Number(anc.coverage_score);
    const confidence = anc.confidence_score == null ? 0 : Number(anc.confidence_score);

    let score;
    switch (priority) {
      case 'anc':
        score = (ancScore ?? 0) * 0.50 + coverage * 0.10 + batteryScore * 0.15 + comfortScore * 0.10 + recencyBonus * 0.05 + valueScore * 0.10;
        break;
      case 'commute':
        score = (ancScore ?? 0) * 0.35 + coverage * 0.10 + multipointScore * 0.20 + batteryScore * 0.15 + btScore * 0.10 + comfortScore * 0.10;
        break;
      case 'battery':
        score = batteryScore * 0.45 + (ancScore ?? 0) * 0.15 + comfortScore * 0.15 + recencyBonus * 0.15 + valueScore * 0.10;
        break;
      case 'sport':
        score = waterScore * 0.40 + comfortScore * 0.25 + batteryScore * 0.20 + (ancScore ?? 0) * 0.10 + recencyBonus * 0.05;
        break;
      case 'value':
        score = valueScore * 0.45 + (ancScore ?? 0) * 0.20 + batteryScore * 0.20 + comfortScore * 0.15;
        break;
      default:
        score = (ancScore ?? 0) * 0.25 + batteryScore * 0.25 + comfortScore * 0.15 + waterScore * 0.15 + recencyBonus * 0.10 + valueScore * 0.10;
    }
    if (m.marquant) score += 5;

    return {
      model: m,
      brand: brandMap[m.brand_id] || { id: m.brand_id, name: m.brand_id, color: '#6C8CFF' },
      score: Math.round(score),
      metrics: {
        totalBattery, batteryScore: Math.round(batteryScore), waterScore, comfortScore: Math.round(comfortScore), valueScore: Math.round(valueScore), year,
        ancScore: ancScore == null ? null : Math.round(ancScore),
        ancTravel: travel == null ? null : Math.round(travel),
        ancOffice: office == null ? null : Math.round(office),
        ancTraffic: traffic == null ? null : Math.round(traffic),
        ancVoices: voices == null ? null : Math.round(voices),
        ancCoverage: Math.round(coverage),
        ancConfidence: Math.round(confidence),
        ancEvidenceCount: Number(anc.evidence_count || anc.direct_evidence_count || 0),
        ancSourceCount: Number(anc.source_count || 0),
      },
    };
  }).sort((a, b) => b.score - a.score);

  const winner = scored[0];
  if (!winner) return { winner: null, alternatives: [], totalUnderBudget: 0 };

  const alternatives = scored.slice(1, 4).map((item, index) => ({
    ...item,
    tag: index === 0 ? (locale === 'en' ? 'Best Value' : 'Meilleur rapport qualité/prix') : index === 1 ? (locale === 'en' ? 'Battery Champion' : 'Champion autonomie') : (locale === 'en' ? 'Tech Alternative' : 'Alternative technologique'),
    reason: locale === 'en' ? `Timeline score ${item.score}/100.` : `Score Timeline ${item.score}/100.`,
  }));

  const whyPoints = [];
  if (winner.metrics.ancScore != null) {
    whyPoints.push(locale === 'en'
      ? `Evidence-based ANC score: ${winner.metrics.ancScore}/100.`
      : `Score ANC fondé sur les preuves : ${winner.metrics.ancScore}/100.`);
  }
  if (winner.metrics.ancCoverage > 0) {
    whyPoints.push(locale === 'en'
      ? `ANC evidence coverage: ${winner.metrics.ancCoverage}% across Travel, Office, Traffic and Voices.`
      : `Couverture des preuves ANC : ${winner.metrics.ancCoverage}% sur Voyage, Bureau, Trafic et Voix.`);
  } else {
    whyPoints.push(locale === 'en' ? 'No environment-specific ANC evidence is available yet.' : 'Aucune preuve ANC par environnement n’est encore disponible.');
  }
  if (winner.metrics.totalBattery >= 24) {
    whyPoints.push(locale === 'en' ? `${winner.metrics.totalBattery}h total battery endurance.` : `${winner.metrics.totalBattery}h d’autonomie totale.`);
  }
  if (winner.model.water_rating) {
    whyPoints.push(locale === 'en' ? `${winner.model.water_rating} protection.` : `Protection ${winner.model.water_rating}.`);
  }

  return { winner: { ...winner, whyPoints: whyPoints.slice(0, 4) }, alternatives, totalUnderBudget: eligibleModels.length };
}
