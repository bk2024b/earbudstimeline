import { yearOf } from '@/lib/format';
import { Link } from '@/i18n/navigation';

const MAX_VISIBLE = 5;

// Composant signature du doc UX Exploration Hooks ("08 — EXPLORE THIS
// STORY") : mini-timeline verticale de toute la lignée d'un produit, teaser
// vers /marques/[brand]/[gamme] — qui contient déjà le détail complet
// (LineageTechGraph, diffs génération par génération). Ce composant ne
// duplique pas ce contenu, il donne juste envie d'y aller.
//
// lineup: tableau trié par date (déjà chargé par la page appelante via
// getGammeModels — aucune requête ici). currentId optionnel (absent sur une
// page qui n'est pas centrée sur un modèle précis, ex. un article).
export default function ExploreThisStory({ lineup, currentId, brandId, brandName, gammeName, gammeSlug, locale }) {
  if (!lineup || lineup.length < 2) return null;
  const en = locale === 'en';

  // Sur une longue lignée, on garde le début, la fin, et le modèle courant —
  // jamais plus de MAX_VISIBLE points, pour rester un teaser et non la liste
  // complète (qui vit sur la page de destination).
  let visible = lineup;
  let visibleIdx = lineup.map((_, i) => i);
  if (lineup.length > MAX_VISIBLE) {
    const currentIdx = currentId ? lineup.findIndex((x) => x.id === currentId) : -1;
    const keep = new Set([0, lineup.length - 1]);
    if (currentIdx >= 0) {
      keep.add(currentIdx);
      if (currentIdx > 0) keep.add(currentIdx - 1);
      if (currentIdx < lineup.length - 1) keep.add(currentIdx + 1);
    }
    visibleIdx = [...keep].sort((a, b) => a - b).slice(0, MAX_VISIBLE);
    visible = visibleIdx.map((i) => lineup[i]);
  }

  const first = lineup[0];
  const last = lineup[lineup.length - 1];
  const period = first.id === last.id ? yearOf(first.release_date) : `${yearOf(first.release_date)} → ${yearOf(last.release_date)}`;

  return (
    <div className="bg-panel border border-line rounded-base p-5 sm:p-6 mb-12">
      <div className="path-indicator text-accent mb-1.5">
        {en ? 'Explore this story' : "Explorer l'histoire complète"}
      </div>
      <h2 className="font-display font-semibold text-lg mb-1">
        {brandName} {gammeName}
      </h2>
      <p className="text-dim text-xs mb-5">
        {period} · {lineup.length} {en ? (lineup.length > 1 ? 'generations' : 'generation') : (lineup.length > 1 ? 'générations' : 'génération')}
      </p>

      <div className="flex flex-col" data-orientation="vertical">
        {visible.map((item, i) => {
          const isCurrent = item.id === currentId;
          const isLast = i === visible.length - 1;
          const gapBefore = i > 0 && visibleIdx[i] - visibleIdx[i - 1] > 1;
          return (
            <div key={item.id}>
              {gapBefore && (
                <div className="flex items-start gap-3 pb-2 -mt-1">
                  <div className="w-2 flex justify-center shrink-0">
                    <span className="text-dim text-xs leading-none">···</span>
                  </div>
                  <span className="text-dim text-[11px]">
                    {en ? `${visibleIdx[i] - visibleIdx[i - 1] - 1} more` : `${visibleIdx[i] - visibleIdx[i - 1] - 1} de plus`}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="timeline-line-point shrink-0 mt-1" data-active={isCurrent} />
                  {!isLast && <span className="w-px flex-1 bg-line my-1" style={{ minHeight: 30 }} />}
                </div>
                <div className={isLast ? 'pb-0' : 'pb-7'}>
                  <div className={`font-mono text-[11px] mb-0.5 ${isCurrent ? 'text-accent' : 'text-dim'}`}>
                    {yearOf(item.release_date)}
                  </div>
                  {isCurrent ? (
                    <div className="text-sm font-semibold text-fg">{item.name}</div>
                  ) : (
                    <Link href={`/ecouteurs/${item.id}`} className="text-sm text-dim hover:text-fg transition-colors">
                      {item.name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link href={`/marques/${brandId}/${gammeSlug}`} className="entity-bridge mt-2">
        {en ? 'Explore the complete story →' : "Explorer l'histoire complète →"}
      </Link>
    </div>
  );
}
