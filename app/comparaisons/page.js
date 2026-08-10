import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { yearOf } from '@/lib/format';
import { canonicalFor } from '@/lib/seo';
import EarbudsIcon from '@/components/EarbudsIcon';
import CompareSelectors from '@/components/CompareSelectors';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Toutes les comparaisons d’écouteurs — EarbudsTimeline',
  description:
    "Comparez des écouteurs sans fil entre générations et entre marques concurrentes : autonomie, ANC, poids, prix et Bluetooth.",
  ...canonicalFor('/comparaisons'),
};

export default async function ComparaisonsPage() {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandOf = (id) => brands.find((b) => b.id === id);

  const generational = getGenerationalPairs(models).slice(0, 16);
  const rivals = getRivalPairs(models, 12);

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Comparaisons</div>
      <h1 className="font-display font-bold text-[32px] mb-2">Toutes les comparaisons</h1>
      <p className="text-dim text-[13.5px] mb-8">
        Choisissez deux modèles librement, ou partez d&apos;une comparaison suggérée ci-dessous.
      </p>

      <div className="mb-12">
        <CompareSelectors brands={brands} models={models} a={undefined} b={undefined} />
      </div>

      {generational.length > 0 && (
        <Section title="Face à leur devancier" pairs={generational} brandOf={brandOf} />
      )}
      {rivals.length > 0 && <Section title="Face à la concurrence" pairs={rivals} brandOf={brandOf} />}

      <Footer />
    </>
  );
}

function Section({ title, pairs, brandOf }) {
  return (
    <div className="mb-12">
      <h2 className="text-[15px] mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pairs.map(({ a, b }) => (
          <Link
            key={`${a.id}-${b.id}`}
            href={`/comparaisons/${buildComparisonSlug(a.id, b.id)}`}
            className="bg-panel border border-line rounded-xl p-4 hover:border-accent transition-colors flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2 text-[13.5px]">
              <EarbudsIcon color={brandOf(a.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
              <span className="truncate">{a.name}</span>
              <span className="text-dim shrink-0">vs</span>
              <span className="truncate">{b.name}</span>
              <EarbudsIcon color={brandOf(b.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
            </div>
            <p className="m-0 text-dim text-[11px]">
              {brandOf(a.brand_id)?.name || a.brand_id} {yearOf(a.release_date)} · {brandOf(b.brand_id)?.name || b.brand_id}{' '}
              {yearOf(b.release_date)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
