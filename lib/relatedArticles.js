// Rattachement simple et transparent : un article est "lié" à un modèle/une
// marque/une gamme si son titre ou son extrait mentionne le(s) terme(s) donné(s).
// Pas de tagging manuel requis — fonctionne dès qu'un article est publié.
export function findRelatedArticles(articles, terms, limit = 3) {
  const needles = terms.filter(Boolean).map((t) => t.toLowerCase());
  if (needles.length === 0) return [];

  const scored = articles
    .map((a) => {
      const haystack = `${a.title} ${a.excerpt}`.toLowerCase();
      const score = needles.reduce((s, n) => s + (haystack.includes(n) ? 1 : 0), 0);
      return { article: a, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.article);
}
