import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BatteryCharging, Cpu, DollarSign } from 'lucide-react';
import { getBrandById, getEarbudsByBrand, getBrands } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { slugify } from '@/lib/slug';
import { yearOf } from '@/lib/format';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import ModelCard from '@/components/ModelCard';
import BrandBadge from '@/components/BrandBadge';
import StatTile from '@/components/StatTile';
import AdSlot from '@/components/AdSlot';
import { Stat, Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const brands = await getBrands();
    return brands.map((b) => ({ brand: b.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, brand: brandId } = params;
  const brand = await getBrandById(brandId).catch(() => null);
  if (!brand) return { title: 'Not found — EarbudsTimeline' };

  const models = (await getEarbudsByBrand(brandId).catch(() => [])) || [];
  const years = models.map((m) => yearOf(m.release_date)).filter(Boolean);
  const period = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '';

  const title =
    locale === 'en'
      ? `${brand.name} — All ${brand.name} earbuds (${period}) | EarbudsTimeline`
      : `${brand.name} — Tous les écouteurs ${brand.name} (${period}) | EarbudsTimeline`;
  const description =
    locale === 'en'
      ? `Complete history of ${brand.name} earbuds: ${models.length} models tracked from ${period}. Battery life, ANC, launch price and generation-by-generation evolution.`
      : `Historique complet des écouteurs ${brand.name} : ${models.length} modèles référencés de ${period}. Autonomie, ANC, prix de lancement et évolution génération par génération.`;

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/marques/${brand.id}`),
    openGraph: {
      title: `${brand.name} — EarbudsTimeline`,
      description: `${models.length} ${brand.name} earbuds tracked, from ${period}.`,
      images: brand.image_url ? [brand.image_url] : undefined,
    },
  };
}

export default async function BrandPage({ params }) {
  const { locale, brand: brandId } = params;
  const brand = await getBrandById(brandId).catch(() => null);
  if (!brand) notFound();

  const [rawModels, t] = await Promise.all([
    getEarbudsByBrand(brandId).catch(() => []),
    getTranslations({ locale, namespace: 'brandPage' }),
  ]);
  const models = rawModels || [];

  const gammes = [...new Set(models.map((m) => m.gamme).filter(Boolean))].map((g) => ({
    name: g,
    slug: slugify(g),
    count: models.filter((m) => m.gamme === g).length,
  }));

  const years = models.map((m) => yearOf(m.release_date)).filter(Boolean);
  const stats = computeStats(models);
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: brand.name, url: `/marques/${brand.id}` },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: brand.name,
          url: `/marques/${brand.id}`,
          locale,
          items: [...models]
            .sort((a, b) => b.release_date.localeCompare(a.release_date))
            .map((m) => ({ url: `/ecouteurs/${m.id}`, name: m.name })),
        })}
      />
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        {t('allBrandsBack')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <BrandBadge brand={brand} size={40} />
            <div>
              <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">{t('eyebrow')}</div>
              <h1 className="font-display font-bold text-[32px] leading-tight m-0">{brand.name}</h1>
            </div>
          </div>
          <div className="flex gap-8 flex-wrap">
            <Stat value={models.length} label={t('models')} />
            <Stat value={`${Math.min(...years)} → ${Math.max(...years)}`} label={t('period')} />
            <Stat value={gammes.length} label={t('lines')} />
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label={t('avgBattery')} />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label={t('commonBt')} />
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label={t('avgPrice')} />}
        </aside>
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('linesTitle')}</h2>
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

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('allModels')}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {models.map((m) => (
          <ModelCard key={m.id} m={m} color={brand.color} locale={locale} />
        ))}
      </div>
      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />
      <Footer locale={locale} />
    </>
  );
}
