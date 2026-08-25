import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { pct } from '@/lib/format';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import ModelCard from '@/components/ModelCard';
import StatTile from '@/components/StatTile';
import { Stat, Footer } from '@/components/UI';

export const revalidate = 3600;

async function loadYear(yearParam) {
  const year = Number(yearParam);
  const [allModels, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const models = allModels
    .filter((m) => Number(m.release_date.slice(0, 4)) === year)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));
  const allYears = [...new Set(allModels.map((m) => Number(m.release_date.slice(0, 4))))].sort((a, b) => a - b);
  return { year, models, brands, allModels, allYears };
}

export async function generateMetadata({ params }) {
  const { locale, year: yearParam } = params;
  const { year, models } = await loadYear(yearParam);
  if (models.length === 0) return { title: `${yearParam} — EarbudsTimeline` };

  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  const title =
    locale === 'en'
      ? `Earbuds released in ${year} — All models (${models.length}) | EarbudsTimeline`
      : `Écouteurs sortis en ${year} — Tous les modèles (${models.length}) | EarbudsTimeline`;
  const description =
    locale === 'en'
      ? `All wireless earbuds released in ${year}: ${models.length} models across ${brandCount} brands. Average battery life, ANC, launch price and trends for the year.`
      : `Tous les écouteurs sans fil sortis en ${year} : ${models.length} modèles chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. Autonomie moyenne, ANC, prix de lancement et tendances de l'année.`;

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/annees/${year}`),
    openGraph: {
      title: locale === 'en' ? `Earbuds released in ${year}` : `Écouteurs sortis en ${year}`,
      description: `${models.length} models, ${brandCount} brands.`,
    },
  };
}

export default async function AnneePage({ params }) {
  const { locale, year: yearParam } = params;
  const { year, models, brands, allModels, allYears } = await loadYear(yearParam);
  if (models.length === 0) notFound();

  const t = await getTranslations({ locale, namespace: 'year' });

  const brandOf = (id) => brands.find((b) => b.id === id);
  const brandsPresent = [...new Set(models.map((m) => m.brand_id))]
    .map((id) => ({ brand: brandOf(id), count: models.filter((m) => m.brand_id === id).length }))
    .filter((x) => x.brand)
    .sort((a, b) => b.count - a.count);

  const stats = computeStats(models);
  const topBrand = brandOf(stats.topBrandId);
  const ancCount = models.filter((m) => m.anc).length;
  const ancShare = Math.round((ancCount / models.length) * 100);

  const prevYearModels = allModels.filter((m) => Number(m.release_date.slice(0, 4)) === year - 1);
  const battTrend = prevYearModels.length > 0 ? pct(stats.avgCaseH, computeStats(prevYearModels).avgCaseH) : null;

  const idx = allYears.indexOf(year);
  const prevYear = idx > 0 ? allYears[idx - 1] : null;
  const nextYear = idx < allYears.length - 1 ? allYears[idx + 1] : null;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  const topBrandClause = topBrand ? t('topBrandClause', { brand: topBrand.name, count: brandsPresent[0].count }) : '';
  const avgPriceClause = stats.avgPrice ? t('avgPriceClause', { price: stats.avgPrice }) : '';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: locale === 'en' ? 'Years' : 'Années', url: '/annees' },
          { name: String(year), url: `/annees/${year}` },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: t('title', { year }),
          url: `/annees/${year}`,
          locale,
          items: models.map((m) => ({ url: `/ecouteurs/${m.id}`, name: m.name })),
        })}
      />

      <Link href="/annees" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        {t('backToAll')}
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">{locale === 'en' ? 'Year' : 'Année'}</div>
        <div className="flex gap-2 text-xs">
          {prevYear && (
            <Link href={`/annees/${prevYear}`} className="text-dim hover:text-accent">
              ← {prevYear}
            </Link>
          )}
          {nextYear && (
            <Link href={`/annees/${nextYear}`} className="text-dim hover:text-accent">
              {nextYear} →
            </Link>
          )}
        </div>
      </div>
      <h1 className="font-display font-bold text-[32px] leading-tight mb-5">{t('title', { year })}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-10">
        <div>
          <div className="flex gap-8 flex-wrap mb-5">
            <Stat value={models.length} label={t('models')} />
            <Stat value={brandsPresent.length} label={t('brands')} />
            <Stat value={`${ancShare}%`} label={t('withAnc')} />
          </div>
          <p className="text-dim text-[14.5px] max-w-2xl leading-relaxed">
            {t('intro', {
              year,
              count: models.length,
              brandCount: brandsPresent.length,
              topBrand: topBrandClause,
              ancCount,
              ancShare,
              avgPrice: avgPriceClause,
            })}
            {battTrend !== null &&
              Math.abs(battTrend) >= 5 &&
              (battTrend > 0
                ? t('batteryTrendUp', { value: Math.abs(battTrend), prevYear: year - 1 })
                : t('batteryTrendDown', { value: Math.abs(battTrend), prevYear: year - 1 }))}
          </p>
        </div>

        <aside className="flex flex-col gap-3">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label={locale === 'en' ? 'Average battery life' : 'Autonomie moyenne'} />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label={locale === 'en' ? 'Most common Bluetooth' : 'Bluetooth le plus courant'} />
          {topBrand && <StatTile icon={Trophy} value={topBrand.name} label={locale === 'en' ? 'Most active brand' : 'Marque la plus active'} />}
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label={locale === 'en' ? 'Average price' : 'Prix moyen'} />}
        </aside>
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('brandsPresent', { year })}</h2>
      <div className="flex gap-2 flex-wrap mb-10">
        {brandsPresent.map(({ brand, count }) => (
          <Link
            key={brand.id}
            href={`/marques/${brand.id}`}
            className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
          >
            {brand.name} · {count}
          </Link>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('allModels', { year })}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
        {models.map((m) => (
          <ModelCard key={m.id} m={m} color={brandOf(m.brand_id)?.color} locale={locale} />
        ))}
      </div>

      <Footer locale={locale} />
    </>
  );
}
