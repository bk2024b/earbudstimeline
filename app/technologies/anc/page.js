import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.anc).length;
  return {
    ...canonicalFor('/technologies/anc'),
    title: `Écouteurs avec réduction de bruit active (ANC) — ${count} modèles | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil avec ANC référencés sur EarbudsTimeline : ${count} modèles, toutes marques confondues.`,
  };
}

export default async function AncPage() {
  const [allModels, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const models = allModels.filter((m) => m.anc);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return (
    <TechHubPage
      eyebrow="Technologie"
      title="Écouteurs avec réduction de bruit active (ANC)"
      intro={`${models.length} écouteurs référencés proposent la réduction de bruit active, chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. L'ANC atténue activement les bruits ambiants en générant une onde sonore inverse, pour une écoute plus immersive dans les transports ou les environnements bruyants.`}
      models={models}
      brands={brands}
      breadcrumbItems={[
        { name: 'Accueil', url: '/' },
        { name: 'Technologies', url: '/technologies' },
        { name: 'ANC', url: '/technologies/anc' },
      ]}
    />
  );
}
