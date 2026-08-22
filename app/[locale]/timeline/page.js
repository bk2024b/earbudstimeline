import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import EvolutionExplorer from '@/components/EvolutionExplorer';
import BrandComparisonChart from '@/components/BrandComparisonChart';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    title: locale === 'en' ? 'Timeline — EarbudsTimeline' : 'Timeline — EarbudsTimeline',
    description:
      locale === 'en'
        ? 'The full interactive history of wireless earbuds, filterable by brand, ANC and Bluetooth version, plus how battery life, weight and price evolved over time.'
        : "L'historique interactif complet des écouteurs sans fil, filtrable par marque, ANC et version Bluetooth, avec l'évolution de l'autonomie, du poids et du prix dans le temps.",
    ...canonicalFor(`/${locale}/timeline`),
  };
}

export default async function TimelinePage({ params, searchParams }) {
  const { locale } = params;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);

  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const title = 'Timeline';
  const sorted = [...models].sort((a, b) => b.release_date.localeCompare(a.release_date));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: title, url: '/timeline' },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: title,
          description: locale === 'en'
            ? 'The full chronological history of wireless earbuds.'
            : "L'historique chronologique complet des écouteurs sans fil.",
          url: '/timeline',
          locale,
          items: sorted.map((m) => ({ url: `/ecouteurs/${m.id}`, name: m.name })),
        })}
      />

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{title}</div>
      <h1 className="font-display font-bold text-[32px] mb-2">
        {locale === 'en' ? 'The full wireless earbuds timeline' : "La timeline complète des écouteurs sans fil"}
      </h1>
      <p className="text-dim text-[13.5px] mb-8 max-w-[640px]">
        {locale === 'en'
          ? `${models.length} models tracked, brand by brand, from the earliest true wireless earbuds to the latest releases. Filter below, or see how key specs evolved over the years.`
          : `${models.length} modèles référencés, marque par marque, des tout premiers écouteurs true wireless aux sorties les plus récentes. Filtrez ci-dessous, ou explorez l'évolution des caractéristiques clés au fil des années.`}
      </p>

      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">
          {locale === 'en' ? 'Evolution over time' : 'Évolution dans le temps'}
        </h2>
        <EvolutionExplorer models={models} brands={brands} />
      </div>

      <div className="mb-12">
        <BrandComparisonChart models={models} brands={brands} />
      </div>

      <InteractiveTimeline
        models={models}
        brands={brands}
        locale={locale}
        initialAnc={searchParams?.anc === 'yes' ? 'yes' : 'all'}
        initialBt={searchParams?.bt || 'all'}
      />

      <Footer locale={locale} />
    </>
  );
}
