import { redirect } from 'next/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { canonicalFor } from '@/lib/seo';
import CompareSelectors from '@/components/CompareSelectors';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Comparateur d’écouteurs — EarbudsTimeline',
  description: 'Comparez deux écouteurs sans fil : autonomie, ANC, poids, prix, USB-C, multipoint et codecs, côte à côte.',
  ...canonicalFor('/comparer'),
};

export default async function ComparePage({ searchParams }) {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const a = models.find((m) => m.id === searchParams.a);
  const b = models.find((m) => m.id === searchParams.b);

  if (a && b) {
    redirect(`/comparaisons/${buildComparisonSlug(a.id, b.id)}`);
  }

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Comparateur</div>
      <h1 className="font-display font-bold text-[32px] mb-6">Comparer deux écouteurs</h1>

      <CompareSelectors brands={brands} models={models} a={searchParams.a} b={searchParams.b} />

      <div className="bg-panel border border-dashed border-line rounded-2xl text-dim text-[13.5px] py-14 text-center">
        Choisissez deux modèles ci-dessus pour lancer la comparaison.
      </div>
      <Footer />
    </>
  );
}
