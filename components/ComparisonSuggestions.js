import Link from 'next/link';
import { buildDiffBullets } from '@/lib/compare';
import { yearOf } from '@/lib/format';

export default function ComparisonSuggestions({ model, suggestions, brandOf }) {
  if (suggestions.length === 0) return null;

  const primary = suggestions[0];
  const bullets = buildDiffBullets(model, primary.model);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
      <div className="bg-panel border border-line rounded-2xl p-5">
        <h2 className="text-[15px] m-0 mb-3.5">
          Comparé à <span className="text-accent">{primary.model.name}</span>
        </h2>
        {bullets.length === 0 ? (
          <p className="text-dim text-[13.5px]">Caractéristiques très proches sur les points clés.</p>
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px]">
                <span
                  className={`font-mono text-xs mt-0.5 shrink-0 ${
                    b.sign === '+' ? 'text-accent' : b.sign === '-' ? 'text-rose-400' : 'text-dim'
                  }`}
                >
                  {b.sign}
                </span>
                <span className="text-dim">{b.text}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/comparer?a=${model.id}&b=${primary.model.id}`}
          className="inline-block mt-4 text-accent text-xs hover:underline"
        >
          Voir la comparaison complète →
        </Link>
      </div>

      <div className="bg-panel border border-line rounded-2xl p-5">
        <h2 className="text-[15px] m-0 mb-3.5">Comparaisons populaires</h2>
        <div className="flex flex-col gap-2">
          {suggestions.map(({ model: other, reason }) => {
            const brand = brandOf(other.brand_id);
            return (
              <div
                key={other.id}
                className="flex items-center justify-between gap-3 bg-panel2 border border-line rounded-xl px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="m-0 text-[13.5px] truncate">
                    {model.name} <span className="text-dim">vs</span> {other.name}
                  </p>
                  <p className="m-0 text-dim text-[11px]">
                    {reason} · {brand?.name || other.brand_id} · {yearOf(other.release_date)}
                  </p>
                </div>
                <Link
                  href={`/comparer?a=${model.id}&b=${other.id}`}
                  className="shrink-0 bg-accent text-ink font-semibold rounded-lg px-3 py-1.5 text-xs"
                >
                  Comparer
                </Link>
              </div>
            );
          })}
        </div>
        <Link href="/comparaisons" className="inline-block mt-4 text-accent text-xs hover:underline">
          Voir toutes les comparaisons →
        </Link>
      </div>
    </div>
  );
}
