import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands, getPublishedArticles } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import ModelCard from '@/components/ModelCard';
import SearchBar from '@/components/SearchBar';
import PopularTags from '@/components/PopularTags';
import HeroArcTimeline from '@/components/HeroArcTimeline';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import HomeComparisons from '@/components/HomeComparisons';
import HomeArticles from '@/components/HomeArticles';
import TrustBar from '@/components/TrustBar';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params, searchParams }) {
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

  return (
    <>
      {/* Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center mb-10">
        <div>
          <div className="inline-block font-mono text-xs text-accent uppercase tracking-[0.1em] bg-accent/10 border border-accent/30 rounded-full px-3 py-1 mb-4">
            {t('badge')}
          </div>
          <h1 className="font-display font-bold leading-[1.08] text-[clamp(30px,5vw,44px)] mb-3.5">
            {t('titleLine1')} <span className="text-accent">{t('titleAccent')}</span>
          </h1>
          <p className="text-dim max-w-[520px] mb-6 text-[15.5px]">{t('subtitle')}</p>

          <div className="mb-3">
            <SearchBar models={models} brands={brands} />
          </div>

          <PopularTags topModels={topRecentMarquant} commonBt={stats.commonBt} locale={locale} />

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/trouver-mes-ecouteurs"
              className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md shadow-accent/20"
            >
              <span>✨</span>
              <span>{locale === 'en' ? 'Find for My Budget' : 'Trouver selon mon budget'}</span>
            </Link>
            <Link
              href="#timeline"
              className="border border-line rounded-lg px-5 py-2.5 text-sm text-dim hover:text-fg hover:border-accent transition-colors"
            >
              {t('exploreTimeline')}
            </Link>
            <Link
              href="/comparaisons"
              className="border border-line rounded-lg px-5 py-2.5 text-sm text-dim hover:text-fg hover:border-accent transition-colors"
            >
              {t('seeComparisons')}
            </Link>
          </div>
        </div>

        <HeroArcTimeline models={models} brands={brands} />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-panel border border-line rounded-2xl px-6 py-6 mb-12">
        <Stat value={models.length} label={t('statEarbuds')} />
        <Stat value={brands.length} label={t('statBrands')} />
        <Stat value={yearsCovered} label={t('statYears')} />
        <Stat value={comparisonCount} label={t('statComparisons')} />
        <Stat value={articles.length} label={t('statArticles')} />
      </div>

      {/* Timeline Intelligence Magnet Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-panel2 via-panel to-ink border border-accent/30 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-wider bg-accent/10 border border-accent/30 rounded-full px-3 py-0.5 mb-3">
              <span>✨</span>
              <span>Timeline Intelligence</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-fg mb-2">
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
              className="bg-white text-ink font-bold rounded-xl px-6 py-3 text-sm inline-flex items-center gap-2 hover:bg-white/90 transition-all shadow-lg hover:translate-x-0.5"
            >
              <span>{locale === 'en' ? 'Launch Intelligence Engine' : 'Trouver mes écouteurs'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Parcourir par marque — seulement les plus représentées ici, la liste
          complète vit sur /marques pour ne pas alourdir la homepage. */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 id="marques" className="text-xs uppercase tracking-[0.1em] text-dim m-0">
            {t('browseByBrand')}
          </h2>
          <Link href="/marques" className="text-xs text-accent hover:underline shrink-0">
            {locale === 'en' ? 'See all brands →' : 'Voir toutes les marques →'}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
          {topBrands.map((b) => {
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
                <h3 className="m-0 mb-1 text-[17px]">{b.name}</h3>
                <p className="m-0 text-dim text-xs">
                  {Math.min(...years)} → {Math.max(...years)} · {t('modelsRange', { count: bModels.length })}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Teaser Timeline — la timeline interactive complète (filtres marque/ANC/BT)
          vit désormais sur sa propre page /timeline, avec les graphes d'évolution. */}
      <div id="timeline" className="bg-panel border border-line rounded-2xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="font-display font-bold text-2xl text-fg mb-2">
            {locale === 'en' ? 'Explore the full timeline' : 'Explorez la timeline complète'}
          </h2>
          <p className="text-xs sm:text-sm text-dim leading-relaxed">
            {locale === 'en'
              ? `Every model, filterable by brand, ANC and Bluetooth version — plus how battery life, weight and price evolved across ${yearsCovered} years.`
              : `Tous les modèles, filtrables par marque, ANC et version Bluetooth — et l'évolution de l'autonomie, du poids et du prix sur ${yearsCovered} ans.`}
          </p>
        </div>
        <Link
          href="/timeline"
          className="shrink-0 bg-accent text-ink font-bold rounded-xl px-6 py-3 text-sm inline-flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
        >
          <span>{locale === 'en' ? 'Open the timeline' : 'Ouvrir la timeline'}</span>
          <span>→</span>
        </Link>
      </div>

      {/* Comparaisons populaires + Articles à la une */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <HomeComparisons pairs={homeComparisonPairs} brandOf={brandOf} locale={locale} />
        <HomeArticles articles={articles.slice(0, 3)} locale={locale} />
      </div>

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
