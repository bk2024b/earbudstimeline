import { notFound } from 'next/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { getCodecList, modelHasCodec } from '@/lib/tech';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function loadCodec(slug) {
  const allModels = await getAllEarbuds();
  const codecs = getCodecList(allModels);
  const entry = codecs.find((c) => c.slug === slug);
  if (!entry) return { name: null, models: [] };

  const models = allModels.filter((m) => modelHasCodec(m, entry.name));
  return { name: entry.name, models };
}

export async function generateMetadata({ params }) {
  const { name, models } = await loadCodec(params.codec);
  if (!name) return { title: 'Codec introuvable — EarbudsTimeline' };

  return {
    title: `Écouteurs ${name} — ${models.length} modèles | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil compatibles ${name} référencés sur EarbudsTimeline : ${models.length} modèles, toutes marques confondues.`,
    ...canonicalFor(`/technologies/codecs/${params.codec}`),
  };
}

export default async function CodecPage({ params }) {
  const { name, models } = await loadCodec(params.codec);
  if (!name || models.length === 0) notFound();

  const brands = await getBrands();
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return (
    <TechHubPage
      eyebrow="Technologie"
      title={`Écouteurs ${name}`}
      intro={`${models.length} écouteurs référencés supportent le codec ${name}, chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. Le codec audio détermine comment le son est compressé puis transmis en Bluetooth entre la source et les écouteurs.`}
      models={models}
      brands={brands}
      breadcrumbItems={[
        { name: 'Accueil', url: '/' },
        { name: 'Technologies', url: '/technologies' },
        { name, url: `/technologies/codecs/${params.codec}` },
      ]}
    />
  );
}
