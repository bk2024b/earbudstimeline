import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds } from '@/lib/queries';
import { buildBreadcrumbJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

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

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{t('title')}</div>
      <h1 className="font-display font-bold text-[32px] mb-2">{t('title')}</h1>
      <p className="text-dim text-[13.5px] mb-8">
        {t('intro', { count: models.length, years: years.length, min: Math.min(...years), max: Math.max(...years) })}
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
              <p className="m-0 text-dim text-xs">{t('modelsAndBrands', { models: yModels.length, brands: brandCount })}</p>
            </Link>
          );
        })}
      </div>

      <Footer locale={locale} />
    </>
  );
}
