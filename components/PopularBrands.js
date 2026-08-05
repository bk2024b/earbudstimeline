import Link from 'next/link';
import BrandBadge from './BrandBadge';

export default function PopularBrands({ brands, models }) {
  const sorted = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold m-0">Marques populaires</h2>
        <Link href="/#marques" className="text-xs text-accent hover:opacity-80">
          Toutes →
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        {sorted.map((b) => (
          <Link
            key={b.id}
            href={`/marques/${b.id}`}
            className="flex items-center justify-between py-2 px-1.5 rounded-lg hover:bg-panel2 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BrandBadge brand={b} size={28} />
              <span className="text-sm">{b.name}</span>
            </div>
            <span className="text-dim text-xs whitespace-nowrap">
              {b.count} modèle{b.count > 1 ? 's' : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
