import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BatteryCharging, Cpu, DollarSign } from 'lucide-react';
import { getBrandById, getEarbudsByBrand } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import ModelCard from '@/components/ModelCard';
import StatTile from '@/components/StatTile';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export default async function BrandPage({ params, searchParams }) {
  const brand = await getBrandById(params.brand).catch(() => null);
  if (!brand) notFound();

  const models = await getEarbudsByBrand(params.brand);
  const gammes = [...new Set(models.map((m) => m.gamme))].map((g) => ({
    name: g,
    count: models.filter((m) => m.gamme === g).length,
  }));

  const activeGamme = searchParams.gamme || 'all';
  const filtered = activeGamme === 'all' ? models : models.filter((m) => m.gamme === activeGamme);
  const years = models.map((m) => Number(m.release_date.slice(0, 4)));
  const stats = computeStats(models);

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Toutes les marques
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-ink shrink-0"
              style={{ background: brand.color }}
            >
              {brand.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">Marque</div>
              <h1 className="font-display font-bold text-[32px] leading-tight m-0">{brand.name}</h1>
            </div>
          </div>
          <div className="flex gap-8 flex-wrap">
            <Stat value={models.length} label="Modèles" />
            <Stat value={`${Math.min(...years)} → ${Math.max(...years)}`} label="Période" />
            <Stat value={gammes.length} label="Gammes" />
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label="Autonomie moyenne" />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label="Bluetooth le plus courant" />
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label="Prix moyen" />}
        </aside>
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Gammes</h2>
      <div className="flex gap-2 flex-wrap mb-8">
        <Chip href={`/marques/${brand.id}`} active={activeGamme === 'all'}>
          Tous
        </Chip>
        {gammes.map((g) => (
          <Chip
            key={g.name}
            href={`/marques/${brand.id}?gamme=${encodeURIComponent(g.name)}`}
            active={activeGamme === g.name}
          >
            {g.name} · {g.count}
          </Chip>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Tous les modèles</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {filtered.map((m) => (
          <ModelCard key={m.id} m={m} color={brand.color} />
        ))}
      </div>
      <Footer />
    </>
  );
}

function Chip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-1.5 rounded-full border text-xs transition-colors ${
        active ? 'bg-accent/15 border-accent text-accent' : 'border-line text-dim hover:border-accent'
      }`}
    >
      {children}
    </Link>
  );
}
