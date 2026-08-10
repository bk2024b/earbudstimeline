import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BatteryCharging, Cpu, DollarSign } from 'lucide-react';
import { getBrandById, getEarbudsByBrand } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { slugify } from '@/lib/slug';
import { buildBreadcrumbJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import ModelCard from '@/components/ModelCard';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const brand = await getBrandById(params.brand).catch(() => null);
  if (!brand) return { title: 'Marque introuvable — EarbudsTimeline' };

  const models = await getEarbudsByBrand(params.brand);
  const years = models.map((m) => Number(m.release_date.slice(0, 4)));
  const period = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '';

  return {
    title: `${brand.name} — Tous les écouteurs ${brand.name} (${period}) | EarbudsTimeline`,
    description: `Historique complet des écouteurs ${brand.name} : ${models.length} modèles référencés de ${period}. Autonomie, ANC, prix de lancement et évolution génération par génération.`,
    ...canonicalFor(`/marques/${brand.id}`),
    openGraph: {
      title: `${brand.name} — EarbudsTimeline`,
      description: `${models.length} écouteurs ${brand.name} référencés, de ${period}.`,
      images: brand.image_url ? [brand.image_url] : undefined,
    },
  };
}

export default async function BrandPage({ params }) {
  const brand = await getBrandById(params.brand).catch(() => null);
  if (!brand) notFound();

  const models = await getEarbudsByBrand(params.brand);
  const gammes = [...new Set(models.map((m) => m.gamme))].map((g) => ({
    name: g,
    slug: slugify(g),
    count: models.filter((m) => m.gamme === g).length,
  }));

  const years = models.map((m) => Number(m.release_date.slice(0, 4)));
  const stats = computeStats(models);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: brand.name, url: `/marques/${brand.id}` },
        ])}
      />
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Toutes les marques
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <BrandBadge brand={brand} size={40} />
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
        {gammes.map((g) => (
          <Link
            key={g.name}
            href={`/marques/${brand.id}/${g.slug}`}
            className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
          >
            {g.name} · {g.count}
          </Link>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Tous les modèles</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {models.map((m) => (
          <ModelCard key={m.id} m={m} color={brand.color} />
        ))}
      </div>
      <Footer />
    </>
  );
}
