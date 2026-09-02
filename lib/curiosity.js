// Génère les phrases "curiosité" décrites dans le doc UX (07 — CURIOSITY
// HOOK) à partir d'une simple comparaison courant vs prédécesseur — les
// mêmes champs que ceux déjà affichés par SpecGroup/EntityGraph, aucune
// nouvelle donnée. Priorité aux écarts "surprenants" (régression) car ce
// sont eux qui créent la curiosité, comme demandé dans le doc.

function pctDiff(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// Retourne un seul insight (le plus notable) ou null s'il n'y a rien
// d'assez net à dire — mieux vaut ne rien afficher qu'une phrase creuse.
export function buildCuriosityInsight(current, previous, { locale } = {}) {
  if (!current || !previous) return null;
  const en = locale === 'en';

  const battery = pctDiff(Number(current.battery_case_h), Number(previous.battery_case_h));
  const weight = pctDiff(Number(current.weight_g), Number(previous.weight_g));
  const price = pctDiff(Number(current.price), Number(previous.price));
  const ancAdded = current.anc && !previous.anc;

  const candidates = [];

  // Régression d'autonomie = le cas "surprenant" le plus fort du doc
  // ("Its predecessor had better battery life. Why?")
  if (battery !== null && battery < 0) {
    candidates.push({
      type: 'surprising',
      eyebrow: en ? 'The surprising part' : 'Le fait surprenant',
      text: en
        ? `Its predecessor actually had ${Math.abs(battery)}% more battery life.`
        : `Son prédécesseur avait en fait ${Math.abs(battery)}% d'autonomie en plus.`,
      href: '/insights',
      cta: en ? 'Explore battery evolution →' : "Explorer l'évolution de l'autonomie →",
    });
  }

  if (battery !== null && battery >= 15) {
    candidates.push({
      type: 'data',
      eyebrow: en ? 'Did you know?' : 'Le saviez-vous ?',
      text: en
        ? `Battery life improved by ${battery}% over its predecessor.`
        : `L'autonomie a progressé de ${battery}% par rapport à son prédécesseur.`,
      href: '/insights',
      cta: en ? 'Explore battery evolution →' : "Explorer l'évolution de l'autonomie →",
    });
  }

  if (ancAdded) {
    candidates.push({
      type: 'data',
      eyebrow: en ? 'Did you know?' : 'Le saviez-vous ?',
      text: en
        ? 'This was the generation that introduced Active Noise Cancellation.'
        : "C'est cette génération qui a introduit l'annulation active de bruit.",
      href: '/technologies/anc',
      cta: en ? 'Explore ANC history →' : "Explorer l'histoire de l'ANC →",
    });
  }

  if (weight !== null && weight <= -10) {
    candidates.push({
      type: 'data',
      eyebrow: en ? 'Did you know?' : 'Le saviez-vous ?',
      text: en
        ? `It's ${Math.abs(weight)}% lighter than its predecessor.`
        : `Il est ${Math.abs(weight)}% plus léger que son prédécesseur.`,
      href: '/insights',
      cta: en ? 'Explore the data →' : 'Explorer les données →',
    });
  }

  if (price !== null && price >= 20) {
    candidates.push({
      type: 'surprising',
      eyebrow: en ? 'The surprising part' : 'Le fait surprenant',
      text: en
        ? `It launched ${price}% more expensive than its predecessor.`
        : `Il est sorti ${price}% plus cher que son prédécesseur.`,
      href: '/insights',
      cta: en ? 'Explore price trends →' : "Explorer l'évolution des prix →",
    });
  }

  // "surprising" prioritaire sur "data" — c'est ce qui accroche le plus,
  // comme indiqué dans le doc ("Le plus important pour la rétention").
  candidates.sort((a, b) => (a.type === 'surprising' ? -1 : 0) - (b.type === 'surprising' ? -1 : 0));

  return candidates[0] || null;
}
