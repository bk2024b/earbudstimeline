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

      <div className="path-indicator text-accent mb-2">{title}</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-fg mb-2">{title}</h1>
      <p className="text-dim text-sm mb-8">
        {locale === 'en'
          ? `${sortedBrands.length} brands, ${models.length} models tracked.`
          : `${sortedBrands.length} marques, ${models.length} modèles référencés.`}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {sortedBrands.map((b) => {
          const bModels = models.filter((m) => m.brand_id === b.id);
          const years = bModels.map((m) => Number(m.release_date.slice(0, 4)));
          const minYear = years.length > 0 ? Math.min(...years) : 2016;
          const maxYear = years.length > 0 ? Math.max(...years) : 2026;
          return (
            <Link
              key={b.id}
              href={`/marques/${b.id}`}
              className="hardware-card group bg-panel p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <BrandBadge brand={b} size={32} />
                <span className="font-mono text-[11px] text-accent/80 bg-accent/10 px-2 py-0.5 rounded-base font-semibold">
                  {b.count}
                </span>
              </div>
              <h2 className="m-0 mb-1 font-display font-bold text-lg text-fg group-hover:text-accent transition-colors">{b.name}</h2>
              <p className="m-0 text-dim text-xs font-mono">
                {minYear} → {maxYear} ·{' '}
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
