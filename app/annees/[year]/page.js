import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BatteryCharging, Cpu, Trophy, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { pct } from '@/lib/format';
import { buildBreadcrumbJsonLd, absoluteUrl, canonicalFor, JsonLd } from '@/lib/seo';
import ModelCard from '@/components/ModelCard';
import StatTile from '@/components/StatTile';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

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
  const { year, models } = await loadYear(params.year);
  if (models.length === 0) return { title: `${params.year} — EarbudsTimeline` };

  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return {
    title: `Écouteurs sortis en ${year} — Tous les modèles (${models.length}) | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil sortis en ${year} : ${models.length} modèles chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. Autonomie moyenne, ANC, prix de lancement et tendances de l'année.`,
    ...canonicalFor(`/annees/${year}`),
    openGraph: {
      title: `Écouteurs sortis en ${year}`,
      description: `${models.length} modèles référencés, ${brandCount} marque${brandCount > 1 ? 's' : ''}.`,
    },
  };
}

export default async function AnneePage({ params }) {
  const { year, models, brands, allModels, allYears } = await loadYear(params.year);
  if (models.length === 0) notFound();

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
  const battTrend =
    prevYearModels.length > 0
      ? pct(stats.avgCaseH, computeStats(prevYearModels).avgCaseH)
      : null;

  const idx = allYears.indexOf(year);
  const prevYear = idx > 0 ? allYears[idx - 1] : null;
  const nextYear = idx < allYears.length - 1 ? allYears[idx + 1] : null;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: 'Années', url: '/annees' },
          { name: String(year), url: `/annees/${year}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Écouteurs sortis en ${year}`,
          itemListElement: models.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(`/ecouteurs/${m.id}`),
            name: m.name,
          })),
        }}
      />

      <Link href="/annees" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Toutes les années
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">Année</div>
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
      <h1 className="font-display font-bold text-[32px] leading-tight mb-5">Écouteurs sortis en {year}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-10">
        <div>
          <div className="flex gap-8 flex-wrap mb-5">
            <Stat value={models.length} label="Modèles" />
            <Stat value={brandsPresent.length} label="Marques" />
            <Stat value={`${ancShare}%`} label="Avec ANC" />
          </div>
          <p className="text-dim text-[14.5px] max-w-2xl leading-relaxed">
            {year} a vu l&apos;arrivée de {models.length} nouveaux modèles d&apos;écouteurs sans fil, répartis sur{' '}
            {brandsPresent.length} marque{brandsPresent.length > 1 ? 's' : ''}
            {topBrand ? `, ${topBrand.name} en tête avec ${brandsPresent[0].count} sortie${brandsPresent[0].count > 1 ? 's' : ''}` : ''}
            . {ancCount} modèle{ancCount > 1 ? 's' : ''} sur {models.length} propose{ancCount === 1 ? '' : 'nt'} la
            réduction de bruit active ({ancShare}%){stats.avgPrice ? `, pour un prix de lancement moyen de ${stats.avgPrice} $` : ''}.
            {battTrend !== null && Math.abs(battTrend) >= 5 && (
              <>
                {' '}
                L&apos;autonomie totale moyenne a {battTrend > 0 ? 'progressé' : 'reculé'} de {Math.abs(battTrend)}%
                par rapport à {year - 1}.
              </>
            )}
          </p>
        </div>

        <aside className="flex flex-col gap-3">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label="Autonomie moyenne" />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label="Bluetooth le plus courant" />
          {topBrand && <StatTile icon={Trophy} value={topBrand.name} label="Marque la plus active" />}
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label="Prix moyen" />}
        </aside>
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Marques présentes en {year}</h2>
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

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Tous les modèles sortis en {year}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
        {models.map((m) => (
          <ModelCard key={m.id} m={m} color={brandOf(m.brand_id)?.color} />
        ))}
      </div>

      <Footer />
    </>
  );
}
