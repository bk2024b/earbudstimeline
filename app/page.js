import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import Waveform from '@/components/Waveform';
import ModelCard from '@/components/ModelCard';
import { Stat, Footer } from '@/components/UI';

export const revalidate = 3600;

export default async function HomePage() {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const yearsCovered = new Set(models.map((m) => m.release_date.slice(0, 4))).size;
  const latest = [...models].sort((a, b) => b.release_date.localeCompare(a.release_date)).slice(0, 6);

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">
        Historique complet des écouteurs sans fil
      </div>
      <h1 className="font-display font-bold leading-[1.08] text-[clamp(30px,5vw,46px)] max-w-[720px] mb-3.5">
        L&apos;évolution complète des écouteurs sans fil, génération par génération.
      </h1>
      <p className="text-dim max-w-[560px] mb-8 text-[15.5px]">
        Autonomie, réduction de bruit et poids, marque par marque, modèle par modèle, depuis les premiers
        AirPods jusqu&apos;aux derniers modèles Pro.
      </p>

      <div className="flex gap-9 flex-wrap mb-11">
        <Stat value={models.length} label="Écouteurs" />
        <Stat value={brands.length} label="Marques" />
        <Stat value={yearsCovered} label="Années couvertes" />
      </div>

      <Waveform models={models} brands={brands} />

      <h2 id="marques" className="text-xs uppercase tracking-[0.1em] text-dim mb-4">
        Marques
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 mb-12">
        {brands.map((b) => {
          const bModels = models.filter((m) => m.brand_id === b.id);
          const years = bModels.map((m) => Number(m.release_date.slice(0, 4)));
          return (
            <Link
              key={b.id}
              href={`/marques/${b.id}`}
              className="bg-panel border border-line rounded-2xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all"
            >
              <div
                className="w-7 h-7 rounded-lg mb-3.5 flex items-center justify-center font-display font-bold text-[13px] text-ink"
                style={{ background: b.color }}
              >
                {b.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="m-0 mb-1 text-[17px]">{b.name}</h3>
              <p className="m-0 text-dim text-xs">
                {Math.min(...years)} → {Math.max(...years)} · {bModels.length} modèle{bModels.length > 1 ? 's' : ''}
              </p>
            </Link>
          );
        })}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Derniers ajouts</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {latest.map((m) => (
          <ModelCard key={m.id} m={m} />
        ))}
      </div>

      <Footer />
    </>
  );
}
