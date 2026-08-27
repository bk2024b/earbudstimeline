import { Link } from '@/i18n/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import BrandBadge from '@/components/BrandBadge';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    title: locale === 'en' ? 'All brands — EarbudsTimeline' : 'Toutes les marques — EarbudsTimeline',
    description:
      locale === 'en'
        ? 'Every wireless earbuds brand tracked on EarbudsTimeline, from the biggest names to niche makers.'
        : "Toutes les marques d'écouteurs sans fil référencées sur EarbudsTimeline, des plus grandes aux plus confidentielles.",
    ...canonicalFor(`/${locale}/marques`),
  };
}

export default async function MarquesPage({ params }) {
  const { locale } = params;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);

  const sortedBrands = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count);

  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const title = locale === 'en' ? 'All brands' : 'Toutes les marques';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: title, url: '/marques' },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: title,
          url: '/marques',
          locale,
          items: sortedBrands.map((b) => ({ url: `/marques/${b.id}`, name: b.name })),
        })}
      />

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{title}</div>
      <h1 className="font-display font-bold text-[32px] mb-2">{title}</h1>
      <p className="text-dim text-[13.5px] mb-8">
        {locale === 'en'
          ? `${sortedBrands.length} brands, ${models.length} models tracked.`
          : `${sortedBrands.length} marques, ${models.length} modèles référencés.`}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
        {sortedBrands.map((b) => {
          const bModels = models.filter((m) => m.brand_id === b.id);
          const years = bModels.map((m) => Number(m.release_date.slice(0, 4)));
          return (
            <Link
              key={b.id}
              href={`/marques/${b.id}`}
              className="bg-panel border border-line rounded-2xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all"
            >
              <div className="mb-3.5">
                <BrandBadge brand={b} size={28} />
              </div>
              <h2 className="m-0 mb-1 text-[17px]">{b.name}</h2>
              <p className="m-0 text-dim text-xs">
                {Math.min(...years)} → {Math.max(...years)} ·{' '}
                {locale === 'en' ? `${b.count} models` : `${b.count} modèles`}
              </p>
            </Link>
          );
        })}
      </div>

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      <Footer locale={locale} />
    </>
  );
}
