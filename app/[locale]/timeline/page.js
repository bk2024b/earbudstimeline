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

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{title}</div>
      <h1 className="font-display font-bold text-[32px] mb-2">
        {locale === 'en' ? 'The full wireless earbuds timeline' : "La timeline complète des écouteurs sans fil"}
      </h1>
      <p className="text-dim text-[13.5px] mb-4 max-w-[640px]">
        {locale === 'en'
          ? `${models.length} models tracked, brand by brand, from the earliest true wireless earbuds to the latest releases. Filter below by brand, ANC or Bluetooth version.`
          : `${models.length} modèles référencés, marque par marque, des tout premiers écouteurs true wireless aux sorties les plus récentes. Filtrez ci-dessous par marque, ANC ou version Bluetooth.`}
      </p>
      <p className="text-dim text-[13px] mb-8">
        {locale === 'en' ? 'Looking for trends instead? ' : 'Vous cherchez plutôt les tendances ? '}
        <Link href="/insights" className="text-accent hover:underline">
          {locale === 'en' ? 'See the data insights →' : 'Voir les analyses de données →'}
        </Link>
      </p>

      <InteractiveTimeline models={models} brands={brands} locale={locale} />

      <Footer locale={locale} />
    </>
  );
}
