import Link from 'next/link';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands, getPublishedArticles } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import ModelCard from '@/components/ModelCard';
import SearchBar from '@/components/SearchBar';
import PopularTags from '@/components/PopularTags';
import HeroArcTimeline from '@/components/HeroArcTimeline';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import EvolutionChart from '@/components/EvolutionChart';
import HomeComparisons from '@/components/HomeComparisons';
import HomeArticles from '@/components/HomeArticles';
import TrustBar from '@/components/TrustBar';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const [models, brands, articles] = await Promise.all([getAllEarbuds(), getBrands(), getPublishedArticles()]);

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

  const topRecentMarquant = [...models]
    .filter((m) => m.marquant)
    .sort((a, b) => b.release_date.localeCompare(a.release_date));

  return (
    <>
      {/* Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center mb-10">
        <div>
          <div className="inline-block font-mono text-xs text-accent uppercase tracking-[0.1em] bg-accent/10 border border-accent/30 rounded-full px-3 py-1 mb-4">
            La référence des écouteurs sans fil
          </div>
          <h1 className="font-display font-bold leading-[1.08] text-[clamp(30px,5vw,44px)] mb-3.5">
            Toute l&apos;histoire des écouteurs. <span className="text-accent">Une timeline.</span>
          </h1>
          <p className="text-dim max-w-[520px] mb-6 text-[15.5px]">
            Explorez, comparez et revivez l&apos;évolution des écouteurs sans fil à travers le temps —
            autonomie, réduction de bruit et poids, marque par marque, modèle par modèle.
          </p>

          <div className="mb-3">
            <SearchBar models={models} brands={brands} />
          </div>

          <PopularTags topModels={topRecentMarquant} commonBt={stats.commonBt} />

          <div className="flex gap-3 flex-wrap">
            <Link
              href="#timeline"
              className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Explorer la timeline
            </Link>
            <Link
              href="/comparaisons"
              className="border border-line rounded-lg px-5 py-2.5 text-sm text-dim hover:text-white hover:border-accent transition-colors"
            >
              Voir les comparaisons
            </Link>
          </div>
        </div>

        <HeroArcTimeline models={models} brands={brands} />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-panel border border-line rounded-2xl px-6 py-6 mb-12">
        <Stat value={models.length} label="Écouteurs" />
        <Stat value={brands.length} label="Marques" />
        <Stat value={yearsCovered} label="Années couvertes" />
        <Stat value={comparisonCount} label="Comparaisons" />
        <Stat value={articles.length} label="Articles publiés" />
      </div>

      {/* Parcourir par marque */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 id="marques" className="text-xs uppercase tracking-[0.1em] text-dim m-0">
            Parcourir par marque
          </h2>
        </div>
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
                <h3 className="m-0 mb-1 text-[17px]">{b.name}</h3>
                <p className="m-0 text-dim text-xs">
                  {Math.min(...years)} → {Math.max(...years)} · {bModels.length} modèle
                  {bModels.length > 1 ? 's' : ''}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div id="timeline">
        <InteractiveTimeline
          models={models}
          brands={brands}
          initialAnc={searchParams?.anc === 'yes' ? 'yes' : 'all'}
          initialBt={searchParams?.bt || 'all'}
        />
      </div>

      {/* Comparaisons populaires + Articles à la une */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <HomeComparisons pairs={homeComparisonPairs} brandOf={brandOf} />
        <HomeArticles articles={articles.slice(0, 3)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Derniers ajouts</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
            {latest.map((m) => (
              <ModelCard key={m.id} m={m} color={colorById[m.brand_id]} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-1">En chiffres</h2>
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label="Autonomie moyenne" />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label="Bluetooth le plus courant" />
          <StatTile icon={Trophy} value={topBrand?.name || '—'} label="Marque la plus représentée" />
          {stats.avgPrice && (
            <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label="Prix moyen au lancement" />
          )}

          <div className="mt-2">
            <EvolutionChart models={models} />
          </div>
        </aside>
      </div>

      <TrustBar />

      <Footer />
    </>
  );
}
