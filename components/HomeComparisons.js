import Link from 'next/link';
import EarbudsIcon from './EarbudsIcon';

export default function HomeComparisons({ pairs, brandOf }) {
  if (pairs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] m-0">Comparaisons populaires</h2>
        <Link href="/comparaisons" className="text-xs text-accent hover:underline">
          Voir toutes →
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {pairs.map(({ a, b }) => (
          <div
            key={`${a.id}-${b.id}`}
            className="flex items-center justify-between gap-3 bg-panel border border-line rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-0 text-[13.5px]">
              <EarbudsIcon color={brandOf(a.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
              <span className="truncate">{a.name}</span>
              <span className="text-dim shrink-0">vs</span>
              <span className="truncate">{b.name}</span>
              <EarbudsIcon color={brandOf(b.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
            </div>
            <Link
              href={`/comparer?a=${a.id}&b=${b.id}`}
              className="shrink-0 bg-accent text-ink font-semibold rounded-lg px-3 py-1.5 text-xs"
            >
              Comparer
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
