import { getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { canonicalFor } from '@/lib/seo';
import CompareSelectors from '@/components/CompareSelectors';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'comparer' });
  return {
    title: `${t('title')} — EarbudsTimeline`,
    description:
      locale === 'en'
        ? 'Compare two wireless earbuds side by side: battery life, ANC, weight, price, USB-C, multipoint and codecs.'
        : 'Comparez deux écouteurs sans fil : autonomie, ANC, poids, prix, USB-C, multipoint et codecs, côte à côte.',
    ...canonicalFor(`/${locale}/comparer`),
  };
}

export default async function ComparePage({ params, searchParams }) {
  const { locale } = params;
  const [models, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'comparer' }),
  ]);
  const a = models.find((m) => m.id === searchParams.a);
  const b = models.find((m) => m.id === searchParams.b);

  if (a && b) {
    redirect({ href: `/comparaisons/${buildComparisonSlug(a.id, b.id)}`, locale });
  }

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{t('title')}</div>
      <h1 className="font-display font-bold text-[32px] mb-6">{t('title')}</h1>

      <CompareSelectors brands={brands} models={models} a={searchParams.a} b={searchParams.b} />

      <div className="bg-panel border border-dashed border-line rounded-2xl text-dim text-[13.5px] py-14 text-center">
        {t('chooseModels')}
      </div>
      <Footer locale={locale} />
    </>
  );
}
