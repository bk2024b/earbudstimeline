import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.anc).length;
  const t = await getTranslations({ locale, namespace: 'tech' });
  return {
    ...canonicalFor(`/${locale}/technologies/anc`),
    title: `${t('ancTitle')} — ${count} ${locale === 'en' ? 'models' : 'modèles'} | EarbudsTimeline`,
    description: t('ancIntro', { count, brandCount: new Set(models.filter((m) => m.anc).map((m) => m.brand_id)).size }),
  };
}

export default async function AncPage({ params }) {
  const { locale } = params;
  const [allModels, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'tech' }),
  ]);
  const models = allModels.filter((m) => m.anc);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <TechHubPage
      eyebrow={locale === 'en' ? 'Technology' : 'Technologie'}
      title={t('ancTitle')}
      intro={t('ancIntro', { count: models.length, brandCount })}
      models={models}
      brands={brands}
      locale={locale}
      breadcrumbItems={[
        { name: homeLabel, url: '/' },
        { name: t('hubTitle'), url: '/technologies' },
        { name: 'ANC', url: '/technologies/anc' },
      ]}
    />
  );
}
