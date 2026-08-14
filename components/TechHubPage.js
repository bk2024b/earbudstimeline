import { getTranslations } from 'next-intl/server';
import { computeStats } from '@/lib/stats';
import { buildBreadcrumbJsonLd, absoluteUrl, JsonLd } from '@/lib/seo';
import ModelCard from './ModelCard';
import { Stat, Footer } from './UI';

export default async function TechHubPage({ eyebrow, title, intro, models, brands, breadcrumbItems, locale }) {
  const t = await getTranslations({ locale, namespace: 'techHub' });
  const brandOf = (id) => brands.find((b) => b.id === id);
  const stats = computeStats(models);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  const sorted = [...models].sort((a, b) => b.release_date.localeCompare(a.release_date));

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems, locale)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: title,
          itemListElement: sorted.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(`/ecouteurs/${m.id}`, locale),
            name: m.name,
          })),
        }}
      />

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{eyebrow}</div>
      <h1 className="font-display font-bold text-[32px] leading-tight mb-5">{title}</h1>

      <div className="flex gap-8 flex-wrap mb-5">
        <Stat value={models.length} label={t('models')} />
        <Stat value={brandCount} label={t('brands')} />
        {stats.avgPrice && <Stat value={`${stats.avgPrice} $`} label={t('avgPrice')} />}
      </div>

      <p className="text-dim text-[14.5px] max-w-2xl mb-10 leading-relaxed">{intro}</p>

      {models.length === 0 ? (
        <p className="text-dim text-sm py-8 text-center border border-dashed border-line rounded-2xl">{t('noModels')}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mb-12">
          {sorted.map((m) => (
            <ModelCard key={m.id} m={m} color={brandOf(m.brand_id)?.color} locale={locale} />
          ))}
        </div>
      )}

      <Footer locale={locale} />
    </>
  );
}
