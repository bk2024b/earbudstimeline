import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.multipoint).length;
  const t = await getTranslations({ locale, namespace: 'tech' });
  return {
    ...canonicalFor(`/${locale}/technologies/multipoint`),
    title: `${t('multipointTitle')} — ${count} ${locale === 'en' ? 'models' : 'modèles'} | EarbudsTimeline`,
    description: t('multipointIntro', { count, brandCount: new Set(models.filter((m) => m.multipoint).map((m) => m.brand_id)).size }),
  };
}

export default async function MultipointPage({ params }) {
  const { locale } = params;
  const [allModels, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'tech' }),
  ]);
  const models = allModels.filter((m) => m.multipoint);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <TechHubPage
      eyebrow={locale === 'en' ? 'Technology' : 'Technologie'}
      title={t('multipointTitle')}
      intro={t('multipointIntro', { count: models.length, brandCount })}
      models={models}
      brands={brands}
      locale={locale}
      breadcrumbItems={[
        { name: homeLabel, url: '/' },
        { name: t('hubTitle'), url: '/technologies' },
        { name: 'Multipoint', url: '/technologies/multipoint' },
      ]}
    />
  );
}
