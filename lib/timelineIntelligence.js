import { slugify } from './slug';
import { getPredecessor } from './evolution';

/**
 * Normalise un score entre 0 et 100
 */
function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Analyse et classe tous les modèles selon le budget et les critères de l'utilisateur.
 * 
 * @param {Array} models - Liste des écouteurs en base
 * @param {Array} brands - Liste des marques
 * @param {Object} preferences - { maxBudget, priority, brandId, locale }
 * @returns {Object} { winner, alternatives, totalUnderBudget, stats }
 */
export function analyzeEarbudsForBudget(models, brands, {
  maxBudget = 200,
  priority = 'balanced', // 'balanced' | 'anc' | 'battery' | 'sport' | 'commute' | 'value'
  brandId = 'all',
  locale = 'fr',
} = {}) {
  if (!models || models.length === 0) {
    return { winner: null, alternatives: [], totalUnderBudget: 0 };
  }

  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b]));

  // 1. Filtrer selon le budget et la marque si spécifiée
  const eligibleModels = models.filter((m) => {
    const price = m.price ?? 150;
    const budgetLimit = maxBudget >= 500 ? Infinity : maxBudget;
    if (price > budgetLimit) return false;

    if (brandId && brandId !== 'all' && m.brand_id !== brandId) {
      return false;
    }

    return true;
  });

  // Si aucun modèle n'est trouvé sous ce budget strict, on prend les modèles les plus abordables
  const candidates = eligibleModels.length > 0
    ? eligibleModels
    : [...models].sort((a, b) => (a.price ?? 999) - (b.price ?? 999)).slice(0, 5);

  // 2. Calcul du score pour chaque candidat
  const scored = candidates.map((m) => {
    const price = m.price ?? 150;
    const year = Number(m.release_date ? m.release_date.slice(0, 4) : 2021);
    const recencyBonus = Math.max(0, (year - 2018) * 4); // Favorise légèrement les modèles récents
    const totalBattery = (m.battery_bud_h || 5) + (m.battery_case_h || 20);

    // Score de base (0 à 100)
    let score = 50;

    // Autonomie (max 8h bud / 32h boîtier = 40h total)
    const batteryScore = clamp((totalBattery / 36) * 100);

    // Réduction de bruit active
    const ancScore = m.anc ? 100 : 0;

    // Étanchéité (IPX2 = 30, IPX4 = 70, IP54 = 85, IP57/IPX7 = 100, Non résistant = 0)
    let waterScore = 0;
    const wr = (m.water_rating || '').toUpperCase();
    if (wr.includes('57') || wr.includes('67') || wr.includes('68') || wr.includes('X7') || wr.includes('X8')) {
      waterScore = 100;
    } else if (wr.includes('54') || wr.includes('55') || wr.includes('X5')) {
      waterScore = 85;
    } else if (wr.includes('X4') || wr.includes('44') || wr.includes('IPX4')) {
      waterScore = 70;
    } else if (wr.includes('X2') || wr.includes('IPX2')) {
      waterScore = 35;
    }

    // Poids / Confort (plus c'est léger par écouteur, plus c'est confortable. 4g = 100, 8g = 40)
    const weight = m.weight_g || 5.5;
    const comfortScore = clamp(100 - (weight - 4) * 15);

    // Connectivité (Bluetooth récent & multipoint)
    const btVersion = parseFloat(m.bluetooth) || 5.0;
    const btScore = clamp(((btVersion - 4.5) / 1.0) * 100);
    const multipointScore = m.multipoint ? 100 : 40;

    // Ratio Qualité/Prix (plus on a de specs pour le prix investi)
    const budgetHeadroom = maxBudget >= 500 ? 300 : maxBudget;
    const valueScore = clamp(((budgetHeadroom - price) / budgetHeadroom) * 50 + (m.anc ? 30 : 0) + (totalBattery > 24 ? 20 : 0));

    // Pondération selon la priorité choisie
    switch (priority) {
      case 'anc':
        score = (ancScore * 0.40) + (batteryScore * 0.20) + (comfortScore * 0.15) + (recencyBonus * 0.15) + (valueScore * 0.10);
        break;
      case 'battery':
        score = (batteryScore * 0.45) + (ancScore * 0.15) + (comfortScore * 0.15) + (recencyBonus * 0.15) + (valueScore * 0.10);
        break;
      case 'sport':
        score = (waterScore * 0.40) + (comfortScore * 0.25) + (batteryScore * 0.20) + (ancScore * 0.10) + (recencyBonus * 0.05);
        break;
      case 'commute':
        score = (multipointScore * 0.25) + (ancScore * 0.30) + (batteryScore * 0.20) + (btScore * 0.15) + (comfortScore * 0.10);
        break;
      case 'value':
        score = (valueScore * 0.45) + (ancScore * 0.20) + (batteryScore * 0.20) + (comfortScore * 0.15);
        break;
      case 'balanced':
      default:
        score = (ancScore * 0.25) + (batteryScore * 0.25) + (comfortScore * 0.15) + (waterScore * 0.15) + (recencyBonus * 0.10) + (valueScore * 0.10);
        break;
    }

    // Modèle marquant dans l'histoire de la marque (bonus reconnaissance)
    if (m.marquant) {
      score += 5;
    }

    return {
      model: m,
      brand: brandMap[m.brand_id] || { id: m.brand_id, name: m.brand_id, color: '#6C8CFF' },
      score: Math.round(score),
      metrics: {
        totalBattery,
        batteryScore: Math.round(batteryScore),
        ancScore: Math.round(ancScore),
        waterScore: Math.round(waterScore),
        comfortScore: Math.round(comfortScore),
        valueScore: Math.round(valueScore),
        year,
      },
    };
  });

  // Trier par score décroissant
  scored.sort((a, b) => b.score - a.score);

  const winnerData = scored[0];
  if (!winnerData) {
    return { winner: null, alternatives: [], totalUnderBudget: 0 };
  }

  // 3. Déterminer l'évolution et le rival du vainqueur
  const winnerGammeModels = models.filter(
    (m) => m.brand_id === winnerData.model.brand_id && m.gamme === winnerData.model.gamme
  );
  const predecessor = getPredecessor(winnerGammeModels, winnerData.model.id);

  // Rival direct (autre marque, même tranche de prix ±30€, même époque)
  const rivalCandidate = models
    .filter((m) => m.brand_id !== winnerData.model.brand_id && Math.abs((m.price || 150) - (winnerData.model.price || 150)) <= 40)
    .sort((a, b) => b.release_date.localeCompare(a.release_date))[0] || null;

  const rival = rivalCandidate ? {
    model: rivalCandidate,
    brand: brandMap[rivalCandidate.brand_id] || { id: rivalCandidate.brand_id, name: rivalCandidate.brand_id, color: '#6C8CFF' },
  } : null;

  // 4. Générer l'argumentaire d'intelligence historique ("Pourquoi ce choix ?")
  const whyPoints = generateWhyAnalysis(winnerData, predecessor, rival, { maxBudget, priority, locale });

  // 5. Sélectionner les 3 alternatives clés
  const otherCandidates = scored.filter((s) => s.model.id !== winnerData.model.id);

  // Alternative 1 : Le meilleur rapport qualité/prix (plus abordable)
  const cheaperUnderBudget = otherCandidates
    .filter((s) => (s.model.price || 0) < (winnerData.model.price || 999))
    .sort((a, b) => b.metrics.valueScore - a.metrics.valueScore)[0];

  // Alternative 2 : Le monstre d'autonomie
  const batteryChampion = otherCandidates
    .filter((s) => s.model.id !== cheaperUnderBudget?.model.id)
    .sort((a, b) => b.metrics.totalBattery - a.metrics.totalBattery)[0];

  // Alternative 3 : Le plus récent / ANC max ou autre écosystème
  const techChampion = otherCandidates
    .filter((s) => s.model.id !== cheaperUnderBudget?.model.id && s.model.id !== batteryChampion?.model.id)
    .sort((a, b) => b.metrics.year - a.metrics.year || b.score - a.score)[0];

  const alternatives = [
    cheaperUnderBudget && {
      ...cheaperUnderBudget,
      tag: locale === 'en' ? 'Best Value / Budget Choice' : 'Meilleur Rapport Qualité / Prix',
      tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      reason: locale === 'en'
        ? `Saves money at $${cheaperUnderBudget.model.price || '—'} while preserving high core performance.`
        : `Moins cher à ${cheaperUnderBudget.model.price || '—'} € tout en conservant d'excellentes prestations.`,
    },
    batteryChampion && {
      ...batteryChampion,
      tag: locale === 'en' ? 'Endurance Champion' : 'Champion de l’Autonomie',
      tagColor: 'text-amber bg-amber/10 border-amber/30',
      reason: locale === 'en'
        ? `Offers ${batteryChampion.metrics.totalBattery}h of total playback (${batteryChampion.model.battery_bud_h}h per bud).`
        : `Offre jusqu'à ${batteryChampion.metrics.totalBattery}h d'écoute totale (${batteryChampion.model.battery_bud_h}h par écouteur).`,
    },
    techChampion && {
      ...techChampion,
      tag: locale === 'en' ? 'Modern / Tech Alternative' : 'Alternative Récente & High-Tech',
      tagColor: 'text-accent bg-accent/10 border-accent/30',
      reason: locale === 'en'
        ? `Released in ${techChampion.metrics.year} with modern ${techChampion.model.bluetooth || '5.3'} Bluetooth standards.`
        : `Sorti en ${techChampion.metrics.year} avec Bluetooth ${techChampion.model.bluetooth || '5.3'} et specs récentes.`,
    },
  ].filter(Boolean);

  return {
    winner: {
      ...winnerData,
      predecessor,
      rival,
      whyPoints,
    },
    alternatives,
    totalUnderBudget: eligibleModels.length,
  };
}

/**
 * Génère des explications intelligentes et contextualisées
 */
function generateWhyAnalysis(winnerData, predecessor, rival, { maxBudget, priority, locale }) {
  const m = winnerData.model;
  const isEn = locale === 'en';
  const points = [];

  // Point 1 : Justification budgétaire
  if (m.price) {
    if (m.price <= maxBudget * 0.85 && maxBudget < 500) {
      points.push(
        isEn
          ? `Exceptional budget fit: at $${m.price}, it sits comfortably below your $${maxBudget} ceiling.`
          : `Placement tarifaire idéal : à ${m.price} €, il reste sous votre plafond de ${maxBudget} € sans compromis.`
      );
    } else {
      points.push(
        isEn
          ? `Optimal price-to-performance ratio in the $${m.price} price tier.`
          : `Le meilleur ratio prestations/prix dans sa tranche tarifaire (${m.price} €).`
      );
    }
  }

  // Point 2 : Force technique majeure (ANC, Autonomie, Poids)
  if (m.anc) {
    points.push(
      isEn
        ? `Active Noise Cancellation (ANC) built-in, isolating ambient noise efficiently in commute and travel.`
        : `Réduction de bruit active (ANC) intégrée pour une isolation sonore efficace au quotidien et en voyage.`
    );
  }

  const totalBattery = (m.battery_bud_h || 0) + (m.battery_case_h || 0);
  if (totalBattery >= 24) {
    points.push(
      isEn
        ? `Solid ${totalBattery}h total battery endurance (${m.battery_bud_h}h per earbud + ${m.battery_case_h}h via case).`
        : `Autonomie solide de ${totalBattery}h au total (${m.battery_bud_h}h par écouteur + ${m.battery_case_h}h via le boîtier).`
    );
  }

  if (m.weight_g && m.weight_g <= 5.0) {
    points.push(
      isEn
        ? `Featherweight comfort (${m.weight_g}g per earbud) ensuring fatigue-free listening all day long.`
        : `Poids plume (${m.weight_g}g par écouteur) garantissant un confort longue durée sans fatigue auriculaire.`
    );
  }

  // Point 3 : Contexte historique vs prédécesseur
  if (predecessor) {
    const batGain = (m.battery_bud_h || 0) - (predecessor.battery_bud_h || 0);
    if (batGain > 0) {
      points.push(
        isEn
          ? `Generational upgrade: gains +${batGain}h of battery life compared to predecessor (${predecessor.name}).`
          : `Évolution générationnelle : gagne +${batGain}h d'autonomie par rapport à son prédécesseur (${predecessor.name}).`
      );
    } else if (m.anc && !predecessor.anc) {
      points.push(
        isEn
          ? `Key lineage milestone: introduces ANC to the ${m.gamme} lineup where ${predecessor.name} was passive only.`
          : `Étape charnière : introduit la réduction de bruit active dans la gamme ${m.gamme} (absente sur ${predecessor.name}).`
      );
    } else {
      points.push(
        isEn
          ? `Direct evolution of ${predecessor.name} with updated chip and refined acoustic ergonomics.`
          : `Évolution directe du ${predecessor.name} avec une puce modernisée et une acoustique affinée.`
      );
    }
  }

  // Point 4 : Résistance à l'eau
  if (m.water_rating && !m.water_rating.toLowerCase().includes('non')) {
    points.push(
      isEn
        ? `Certified ${m.water_rating} water and sweat resistance for workout sessions and rainy days.`
        : `Certification ${m.water_rating} assurant une protection éprouvée contre la transpiration et la pluie.`
    );
  }

  return points.slice(0, 4);
}
