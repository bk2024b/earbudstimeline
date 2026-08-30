import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands, getPublishedArticles } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import ModelCard from '@/components/ModelCard';
import SearchBar from '@/components/SearchBar';
import PopularTags from '@/components/PopularTags';
import HomeStoryTimeline from '@/components/HomeStoryTimeline';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import HomeComparisons from '@/components/HomeComparisons';
import HomeArticles from '@/components/HomeArticles';
import TrustBar from '@/components/TrustBar';
import AdSlot from '@/components/AdSlot';
import { Stat, Footer } from '@/components/UI';

export const revalidate = 3600;

export default async function HomePage({ params }) {
  const { locale } = params;
  const [models, brands, articles, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getPublishedArticles(locale),
    getTranslations({ locale, namespace: 'home' }),
  ]);

  const yearsCovered = new Set(models.map((m) => m.release_date.slice(0, 4))).size;
  const latest = [...models].sort((a, b) => b.release_date.localeCompare(a.release_date)).slice(0, 6);
  const colorById = Object.fromEntries(brands.map((b) => [b.id, b.color]));
  const stats = computeStats(models);
  const topBrand = brands.find((b) => b.id === stats.topBrandId);
  const brandOf = (id) => brands.find((b) => b.id === id);

  const generational = getGenerationalPairs(models);
  const rivals = getRivalPairs(models, 6);
  const comparisonCount = generational.length + rivals.length;
  const homeComparisonPairs = [...generational.slice(0, 2), ...rivals.slice(0, 1)];

  const sortedBrands = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count);
  const topBrands = sortedBrands.slice(0, 10);

  const topRecentMarquant = [...models]
    .filter((m) => m.marquant)
    .sort((a, b) => b.release_date.localeCompare(a.release_date));

  // Preview de la home — répartit des modèles marquants réels sur toute la
  // période couverte (pas juste les plus récents), pour donner un vrai
  // aperçu de "2016 → aujourd'hui" comme la maquette Stitch. Se termine par
  // le placeholder éditorial "Next Gen..." (fidèle à la maquette).
  const yearsAvailable = [...new Set(models.map((m) => Number(m.release_date.slice(0, 4))))].sort((a, b) => a - b);
  const PREVIEW_COUNT = 4;
  const previewYears =
    yearsAvailable.length <= PREVIEW_COUNT
      ? yearsAvailable
      : Array.from({ length: PREVIEW_COUNT }, (_, i) => {
          const idx = Math.round((i * (yearsAvailable.length - 1)) / (PREVIEW_COUNT - 1));
          return yearsAvailable[idx];
        }).filter((y, i, arr) => arr.indexOf(y) === i);
  const previewEntries = previewYears
    .map((year) => {
      const yearModels = models.filter((m) => Number(m.release_date.slice(0, 4)) === year);
      const flagship = yearModels.find((m) => m.marquant) || yearModels[0];
      return flagship ? { year, model: flagship } : null;
    })
    .filter(Boolean);
  previewEntries.push({ year: locale === 'en' ? 'Today' : "Aujourd'hui", model: null });

  return (
    <>
      {/* Hero — Sonic Chronology Design */}
      <div className="relative text-center max-w-3xl mx-auto mb-16 sm:mb-24 pt-4 sm:pt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[250px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-[0.14em] bg-accent/10 border border-accent/30 rounded-base px-3.5 py-1 mb-6 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>{t('badge')}</span>
        </div>

        <h1 className="font-display font-bold leading-[1.02] text-4xl sm:text-6xl lg:text-7xl mb-4 tracking-tight">
          <span className="text-brand-gradient block sm:inline">{t('titleLine1')}</span>{' '}
          <span className="text-accent">{t('titleAccent')}</span>
        </h1>

        <div className="flex items-center justify-center gap-3 font-display font-bold text-2xl sm:text-4xl text-accent mb-6 signal-glow">
          <span>{yearsAvailable[0]}</span>
          <span className="text-dim/60 text-lg sm:text-2xl font-mono">→</span>
          <span>{yearsAvailable[yearsAvailable.length - 1]}</span>
        </div>

        <p className="text-dim max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">{t('subtitle')}</p>

        <div className="mb-5 max-w-md mx-auto">
          <SearchBar
            models={models.map(({ id, name, brand_id, gamme }) => ({ id, name, brand_id, gamme }))}
            brands={brands}
          />
        </div>

        <div className="flex justify-center mb-8">
          <PopularTags topModels={topRecentMarquant} commonBt={stats.commonBt} locale={locale} />
        </div>

        <div className="flex gap-4 flex-wrap justify-center items-center">
          <Link
            href="/trouver-mes-ecouteurs"
            className="btn-primary"
          >
            <span>✨</span>
            <span>{locale === 'en' ? 'Find for My Budget' : 'Trouver selon mon budget'}</span>
          </Link>
          <Link
            href="/comparaisons"
            className="btn-ghost"
          >
            {t('seeComparisons')}
          </Link>
        </div>
      </div>

      {/* Timeline Experience */}
      <div id="timeline">
        <HomeStoryTimeline entries={previewEntries} colorById={colorById} locale={locale} />
        <div className="flex flex-wrap justify-center gap-3 -mt-10 mb-16">
          <Link
            href="/timeline"
            className="btn-primary px-6 py-3 text-sm"
          >
            <span>{t('exploreTimeline')}</span>
            <span>→</span>
          </Link>
          <Link
            href="/insights"
            className="btn-ghost px-6 py-3 text-sm"
          >
            <span>{locale === 'en' ? 'See insights' : 'Voir les insights'}</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 hardware-card bg-panel p-6 sm:p-8 mb-16">
        <Stat value={models.length} label={t('statEarbuds')} />
        <Stat value={brands.length} label={t('statBrands')} />
        <Stat value={yearsCovered} label={t('statYears')} />
        <Stat value={comparisonCount} label={t('statComparisons')} />
        <Stat value={articles.length} label={t('statArticles')} />
      </div>

      {/* Timeline Intelligence Magnet Banner */}
      <div className="hardware-card relative overflow-hidden bg-gradient-to-br from-panel2 via-panel to-page border border-accent/40 p-6 sm:p-8 mb-16 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-wider bg-accent/10 border border-accent/30 rounded-base px-3 py-1 mb-3.5 font-semibold">
              <span>✨</span>
              <span>Timeline Intelligence</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-fg mb-2.5 leading-tight">
              {locale === 'en'
                ? 'Looking for the best earbuds for your budget?'
                : 'Quel écouteur sans fil acheter selon votre budget ?'}
            </h2>
            <p className="text-xs sm:text-sm text-dim leading-relaxed">
              {locale === 'en'
                ? 'Our historical engine analyzes battery, active noise cancellation, weight and generational evolution to recommend the exact #1 model for your price range.'
                : 'Notre moteur analyse l’autonomie, la réduction de bruit, le confort et l’évolution historique pour vous recommander le meilleur modèle à votre prix.'}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/trouver-mes-ecouteurs"
              className="btn-primary px-6 py-3.5"
            >
              <span>{locale === 'en' ? 'Launch Intelligence Engine' : 'Trouver mes écouteurs'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Parcourir par marque */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="path-indicator text-accent text-[11px] m-0">
            {t('browseByBrand')}
          </div>
          <Link href="/marques" className="text-xs text-accent hover:underline font-mono shrink-0">
            {locale === 'en' ? 'See all brands →' : 'Voir toutes les marques →'}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {topBrands.map((b) => {
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
                  <BrandBadge brand={b} size={30} />
                  <span className="font-mono text-[11px] text-accent/80 bg-accent/10 px-2 py-0.5 rounded-base font-semibold">
                    {b.count}
                  </span>
                </div>
                <h3 className="m-0 mb-1 font-display font-bold text-lg text-fg group-hover:text-accent transition-colors">{b.name}</h3>
                <p className="m-0 text-dim text-xs font-mono">
                  {minYear} → {maxYear} · {t('modelsRange', { count: bModels.length })}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      {/* Comparaisons populaires + Articles à la une */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <HomeComparisons pairs={homeComparisonPairs} brandOf={brandOf} locale={locale} />
        <HomeArticles articles={articles.slice(0, 3)} locale={locale} />
      </div>

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_AFTER_INTRO_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_AFTER_INTRO_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('latestAdditions')}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
            {latest.map((m) => (
              <ModelCard key={m.id} m={m} color={colorById[m.brand_id]} locale={locale} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-1">{t('byTheNumbers')}</h2>
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label={t('avgBatteryLife')} />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label={t('mostCommonBt')} />
          <StatTile icon={Trophy} value={topBrand?.name || '—'} label={t('topBrand')} />
          {stats.avgPrice && (
            <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label={t('avgLaunchPrice')} />
          )}
        </aside>
      </div>

      <TrustBar locale={locale} />

      <Footer locale={locale} />
    </>
  );
}
