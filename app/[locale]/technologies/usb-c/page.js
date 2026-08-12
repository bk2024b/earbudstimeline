import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.usb_c).length;
  const t = await getTranslations({ locale, namespace: 'tech' });
  return {
    ...canonicalFor(`/${locale}/technologies/usb-c`),
    title: `${t('usbCTitle')} — ${count} ${locale === 'en' ? 'models' : 'modèles'} | EarbudsTimeline`,
    description: t('usbCIntro', { count, brandCount: new Set(models.filter((m) => m.usb_c).map((m) => m.brand_id)).size }),
  };
}

export default async function UsbCPage({ params }) {
  const { locale } = params;
  const [allModels, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'tech' }),
  ]);
  const models = allModels.filter((m) => m.usb_c);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <TechHubPage
      eyebrow={locale === 'en' ? 'Technology' : 'Technologie'}
      title={t('usbCTitle')}
      intro={t('usbCIntro', { count: models.length, brandCount })}
      models={models}
      brands={brands}
      locale={locale}
      breadcrumbItems={[
        { name: homeLabel, url: '/' },
        { name: t('hubTitle'), url: '/technologies' },
        { name: 'USB-C', url: '/technologies/usb-c' },
      ]}
    />
  );
}
