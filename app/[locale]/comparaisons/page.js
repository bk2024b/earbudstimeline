import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { yearOf } from '@/lib/format';
import { buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import EarbudsIcon from '@/components/EarbudsIcon';
import CompareSelectors from '@/components/CompareSelectors';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'comparisonsHub' });
  return {
    title: `${t('title')} — EarbudsTimeline`,
    description:
      locale === 'en'
        ? 'Compare wireless earbuds across generations and against competing brands: battery life, ANC, weight, price and Bluetooth.'
        : 'Comparez des écouteurs sans fil entre générations et entre marques concurrentes : autonomie, ANC, poids, prix et Bluetooth.',
    ...canonicalFor(`/${locale}/comparaisons`),
  };
}

export default async function ComparaisonsPage({ params }) {
  const { locale } = params;
  const [models, brands, t, tc] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'comparisonsHub' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const brandOf = (id) => brands.find((b) => b.id === id);

  const generational = getGenerationalPairs(models).slice(0, 16);
  const rivals = getRivalPairs(models, 12);

  const collectionItems = [...generational, ...rivals].map(({ a, b }) => ({
    url: `/comparaisons/${buildComparisonSlug(a.id, b.id)}`,
    name: `${a.name} vs ${b.name}`,
  }));

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: t('title'),
          description: t('intro'),
          url: '/comparaisons',
          locale,
          items: collectionItems,
        })}
      />

      <div className="path-indicator text-accent mb-2">{t('title')}</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-fg mb-2">{t('title')}</h1>
      <p className="text-dim text-sm mb-8 leading-relaxed max-w-2xl">{t('intro')}</p>

      <div className="mb-12">
        <CompareSelectors brands={brands} models={models} a={undefined} b={undefined} />
      </div>

      {generational.length > 0 && <Section title={t('generational')} pairs={generational} brandOf={brandOf} vs={tc('vs')} />}

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_COMPARISON_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_COMPARISON_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      {rivals.length > 0 && <Section title={t('rivals')} pairs={rivals} brandOf={brandOf} vs={tc('vs')} />}

      <Footer locale={locale} />
    </>
  );
}

function Section({ title, pairs, brandOf, vs }) {
  return (
    <div className="mb-12">
      <div className="path-indicator text-accent text-[11px] mb-3">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pairs.map(({ a, b }) => (
          <Link
            key={`${a.id}-${b.id}`}
            href={`/comparaisons/${buildComparisonSlug(a.id, b.id)}`}
            className="hardware-card group bg-panel p-4 flex flex-col justify-between gap-2.5"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <EarbudsIcon color={brandOf(a.brand_id)?.color || '#9A9AA3'} className="w-5 h-5 shrink-0" />
              <span className="truncate text-fg group-hover:text-accent transition-colors">{a.name}</span>
              <span className="text-accent font-mono text-xs px-1.5 py-0.5 bg-accent/10 rounded-base shrink-0">{vs}</span>
              <span className="truncate text-fg group-hover:text-accent transition-colors">{b.name}</span>
              <EarbudsIcon color={brandOf(b.brand_id)?.color || '#9A9AA3'} className="w-5 h-5 shrink-0" />
            </div>
            <p className="m-0 text-dim text-[11px] font-mono">
              {brandOf(a.brand_id)?.name || a.brand_id} ({yearOf(a.release_date)}) · {brandOf(b.brand_id)?.name || b.brand_id}{' '}
              ({yearOf(b.release_date)})
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
