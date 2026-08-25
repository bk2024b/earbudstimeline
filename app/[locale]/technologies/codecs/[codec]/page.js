import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { getCodecList, modelHasCodec } from '@/lib/tech';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const models = await getAllEarbuds();
    return getCodecList(models).map((c) => ({ codec: c.slug }));
  } catch {
    return [];
  }
}

async function loadCodec(slug) {
  const allModels = await getAllEarbuds();
  const codecs = getCodecList(allModels);
  const entry = codecs.find((c) => c.slug === slug);
  if (!entry) return { name: null, models: [] };

  const models = allModels.filter((m) => modelHasCodec(m, entry.name));
  return { name: entry.name, models };
}

export async function generateMetadata({ params }) {
  const { locale, codec } = params;
  const { name, models } = await loadCodec(codec);
  if (!name) return { title: 'Not found — EarbudsTimeline' };

  const t = await getTranslations({ locale, namespace: 'tech' });
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return {
    title: `${t('codecTitle', { name })} — ${models.length} ${locale === 'en' ? 'models' : 'modèles'} | EarbudsTimeline`,
    description: t('codecIntro', { name, count: models.length, brandCount }),
    ...canonicalFor(`/${locale}/technologies/codecs/${codec}`),
  };
}

export default async function CodecPage({ params }) {
  const { locale, codec } = params;
  const { name, models } = await loadCodec(codec);
  if (!name || models.length === 0) notFound();

  const [brands, t] = await Promise.all([getBrands(), getTranslations({ locale, namespace: 'tech' })]);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <TechHubPage
      eyebrow={locale === 'en' ? 'Technology' : 'Technologie'}
      title={t('codecTitle', { name })}
      intro={t('codecIntro', { name, count: models.length, brandCount })}
      models={models}
      brands={brands}
      locale={locale}
      breadcrumbItems={[
        { name: homeLabel, url: '/' },
        { name: t('hubTitle'), url: '/technologies' },
        { name, url: `/technologies/codecs/${codec}` },
      ]}
    />
  );
}
