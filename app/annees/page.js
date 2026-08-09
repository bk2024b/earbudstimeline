import Link from 'next/link';
import { getAllEarbuds } from '@/lib/queries';
import { buildBreadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Écouteurs par année — EarbudsTimeline',
  description: "Tous les écouteurs sans fil référencés, classés par année de sortie, de la première à la plus récente.",
};

export default async function AnneesPage() {
  const models = await getAllEarbuds();

  const byYear = new Map();
  for (const m of models) {
    const y = Number(m.release_date.slice(0, 4));
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(m);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: 'Années', url: '/annees' },
        ])}
      />

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Années</div>
      <h1 className="font-display font-bold text-[32px] mb-2">Écouteurs par année</h1>
      <p className="text-dim text-[13.5px] mb-8">
        {models.length} modèles référencés sur {years.length} années, de {Math.min(...years)} à {Math.max(...years)}.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5">
        {years.map((y) => {
          const yModels = byYear.get(y);
          const brandCount = new Set(yModels.map((m) => m.brand_id)).size;
          return (
            <Link
              key={y}
              href={`/annees/${y}`}
              className="bg-panel border border-line rounded-2xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all"
            >
              <h2 className="font-display font-bold text-2xl m-0 mb-1">{y}</h2>
              <p className="m-0 text-dim text-xs">
                {yModels.length} modèle{yModels.length > 1 ? 's' : ''} · {brandCount} marque{brandCount > 1 ? 's' : ''}
              </p>
            </Link>
          );
        })}
      </div>

      <Footer />
    </>
  );
}
