import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale, version } = params;
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.bluetooth === version).length;
  if (count === 0) return { title: 'Not found — EarbudsTimeline' };

  const t = await getTranslations({ locale, namespace: 'tech' });
  const brandCount = new Set(models.filter((m) => m.bluetooth === version).map((m) => m.brand_id)).size;

  return {
    title: `${t('bluetoothTitle', { version })} — ${count} ${locale === 'en' ? 'models' : 'modèles'} | EarbudsTimeline`,
    description: t('bluetoothIntro', { version, count, brandCount }),
    ...canonicalFor(`/${locale}/technologies/bluetooth/${version}`),
  };
}

export default async function BluetoothVersionPage({ params }) {
  const { locale, version } = params;
  const [allModels, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'tech' }),
  ]);
  const models = allModels.filter((m) => m.bluetooth === version);
  if (models.length === 0) notFound();

  const brandCount = new Set(models.map((m) => m.brand_id)).size;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <TechHubPage
      eyebrow={locale === 'en' ? 'Technology' : 'Technologie'}
      title={t('bluetoothTitle', { version })}
      intro={t('bluetoothIntro', { version, count: models.length, brandCount })}
      models={models}
      brands={brands}
      locale={locale}
      breadcrumbItems={[
        { name: homeLabel, url: '/' },
        { name: t('hubTitle'), url: '/technologies' },
        { name: `Bluetooth ${version}`, url: `/technologies/bluetooth/${version}` },
      ]}
    />
  );
}
