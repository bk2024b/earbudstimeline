import Link from 'next/link';
import Image from 'next/image';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import ModelCard from '@/components/ModelCard';
import SearchBar from '@/components/SearchBar';
import PopularBrands from '@/components/PopularBrands';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import EvolutionChart from '@/components/EvolutionChart';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const yearsCovered = new Set(models.map((m) => m.release_date.slice(0, 4))).size;
  const latest = [...models].sort((a, b) => b.release_date.localeCompare(a.release_date)).slice(0, 6);
  const colorById = Object.fromEntries(brands.map((b) => [b.id, b.color]));
  const stats = computeStats(models);
  const topBrand = brands.find((b) => b.id === stats.topBrandId);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-12">
        <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">
              Explore. Compare. Découvre.
            </div>
            <h1 className="font-display font-bold leading-[1.08] text-[clamp(30px,5vw,44px)] mb-3.5">
              L&apos;évolution complète des <span className="text-accent">écouteurs</span>.
            </h1>
            <p className="text-dim max-w-[520px] mb-6 text-[15.5px]">
              Autonomie, réduction de bruit et poids, marque par marque, modèle par modèle — depuis les
              premiers vrais sans-fil jusqu&apos;aux derniers modèles Pro.
            </p>

            <div className="mb-8">
              <SearchBar models={models} brands={brands} />
            </div>

            <div className="flex gap-8 flex-wrap">
              <Stat value={models.length} label="Écouteurs" />
              <Stat value={brands.length} label="Marques" />
              <Stat value={yearsCovered} label="Années couvertes" />
            </div>
          </div>

          <div className="hidden sm:block shrink-0">
            <Image
              src="/hero-earbuds.png"
              alt=""
              width={300}
              height={289}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <PopularBrands brands={brands} models={models} />
        </aside>
      </div>

      <InteractiveTimeline models={models} brands={brands} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h2 id="marques" className="text-xs uppercase tracking-[0.1em] text-dim mb-4">
            Derniers ajouts
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
            {latest.map((m) => (
              <ModelCard key={m.id} m={m} color={colorById[m.brand_id]} />
            ))}
          </div>

          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Marques</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-12">
            {brands.map((b) => {
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

      <Footer />
    </>
  );
}
