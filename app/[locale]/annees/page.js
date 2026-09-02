import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds } from '@/lib/queries';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'years' });
  return {
    title: `${t('title')} — EarbudsTimeline`,
    description:
      locale === 'en'
        ? 'All tracked wireless earbuds, sorted by release year, from the earliest to the most recent.'
        : "Tous les écouteurs sans fil référencés, classés par année de sortie, de la première à la plus récente.",
    ...canonicalFor(`/${locale}/annees`),
  };
}

export default async function AnneesPage({ params }) {
  const { locale } = params;
  const [models, t] = await Promise.all([getAllEarbuds(), getTranslations({ locale, namespace: 'years' })]);

  const byYear = new Map();
  for (const m of models) {
    const y = Number(m.release_date.slice(0, 4));
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(m);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: t('title'), url: '/annees' },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: t('title'),
          url: '/annees',
          locale,
          items: years.map((y) => ({ url: `/annees/${y}`, name: String(y) })),
        })}
      />

      <div className="path-indicator text-accent mb-2">{t('title')}</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-fg mb-2">{t('title')}</h1>
      <p className="text-dim text-sm mb-8 leading-relaxed max-w-2xl">
        {t('intro', { count: models.length, years: years.length, min: Math.min(...years), max: Math.max(...years) })}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {years.map((y) => {
          const yModels = byYear.get(y);
          const brandCount = new Set(yModels.map((m) => m.brand_id)).size;
          return (
            <Link
              key={y}
              href={`/annees/${y}`}
              className="hardware-card group bg-panel p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display font-bold text-2xl text-fg group-hover:text-accent transition-colors m-0">{y}</h2>
                <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-2 py-0.5 rounded-base font-semibold">
                  {yModels.length}
                </span>
              </div>
              <p className="m-0 text-dim text-xs font-mono">{t('modelsAndBrands', { models: yModels.length, brands: brandCount })}</p>
            </Link>
          );
        })}
      </div>

      <Footer locale={locale} />
    </>
  );
}
