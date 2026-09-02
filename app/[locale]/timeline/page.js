import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import { Link } from '@/i18n/navigation';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    title: locale === 'en' ? 'Timeline — EarbudsTimeline' : 'Timeline — EarbudsTimeline',
    description:
      locale === 'en'
        ? 'The full interactive history of wireless earbuds, filterable by brand, ANC and Bluetooth version.'
        : "L'historique interactif complet des écouteurs sans fil, filtrable par marque, ANC et version Bluetooth.",
    ...canonicalFor(`/${locale}/timeline`),
  };
}

export default async function TimelinePage({ params }) {
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

      <div className="path-indicator text-accent mb-2">{title}</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-fg mb-3 tracking-tight">
        {locale === 'en' ? 'The full wireless earbuds timeline' : "La timeline complète des écouteurs sans fil"}
      </h1>
      <p className="text-dim text-sm sm:text-base mb-3 max-w-2xl leading-relaxed">
        {locale === 'en'
          ? `${models.length} models tracked, brand by brand, from the earliest true wireless earbuds to the latest releases. Filter below by brand, ANC or Bluetooth version.`
          : `${models.length} modèles référencés, marque par marque, des tout premiers écouteurs true wireless aux sorties les plus récentes. Filtrez ci-dessous par marque, ANC ou version Bluetooth.`}
      </p>
      <div className="mb-8">
        <Link href="/insights" className="entity-bridge">
          {locale === 'en' ? 'Explore aggregate data insights →' : 'Explorer les analyses et tendances globales →'}
        </Link>
      </div>

      <InteractiveTimeline models={models} brands={brands} locale={locale} />

      <Footer locale={locale} />
    </>
  );
}
