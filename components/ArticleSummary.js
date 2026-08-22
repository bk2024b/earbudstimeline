/**
 * Bloc éditorial "En bref" : donne l'essentiel de l'article en quelques
 * secondes, avant le corps du texte. Visuellement distinct du `.prose`
 * (fond + bordure accentuée) pour ne pas être confondu avec un paragraphe.
 */
export default function ArticleSummary({ text, label }) {
  if (!text) return null;

  return (
    <div className="mb-8 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
      <p className="m-0 text-xs uppercase tracking-[0.1em] text-accent font-medium">{label}</p>
      <p className="m-0 mt-2 text-[15px] leading-relaxed text-fg">{text}</p>
    </div>
  );
}
