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
