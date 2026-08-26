/**
 * Découpe le HTML d'un article en sections à partir des balises <h2>.
 * sections[0]      = introduction (contenu avant le premier <h2>, peut être vide)
 * sections[1..n]   = chaque section commençant par un <h2>
 */
export function splitArticleSections(html) {
  if (!html) return [''];
  const parts = html.split(/(?=<h2\b)/i);
  return parts.filter((part) => part.trim().length > 0);
}

/**
 * Trouve l'index de la section FAQ (si présente) en cherchant "FAQ" ou
 * "Foire aux questions" dans le titre h2 de chaque section.
 */
export function findFaqSectionIndex(sections) {
  return sections.findIndex((section) => {
    const headingMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (!headingMatch) return false;
    return /faq|foire aux questions/i.test(headingMatch[1]);
  });
}

/**
 * Calcule les positions d'insertion des emplacements pub dans un article :
 * - après l'intro (avant la 1re section h2)
 * - au milieu de l'article
 * - avant la FAQ (ou avant l'avant-dernière section si pas de FAQ détectée)
 *
 * Les articles courts (moins de 4 sections h2) n'affichent qu'une seule pub
 * (après l'intro) pour éviter de saturer un contenu léger.
 */
export function computeAdPositions(sections) {
  const total = sections.length;
  const contentSectionsCount = total - 1; // sections[0] = intro

  const positions = { afterIntro: total > 1, mid: null, beforeFaq: null };

  if (contentSectionsCount < 4) {
    return positions;
  }

  const faqIndex = findFaqSectionIndex(sections);
  const midIndex = Math.floor(total / 2);

  positions.mid = midIndex > 1 ? midIndex : null;

  if (faqIndex > 1 && faqIndex !== positions.mid) {
    positions.beforeFaq = faqIndex;
  } else if (faqIndex === -1 && total - 2 > (positions.mid || 1)) {
    positions.beforeFaq = total - 2; // fallback : avant l'avant-dernière section
  }

  return positions;
}
