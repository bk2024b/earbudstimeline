import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.multipoint).length;
  return {
    title: `Écouteurs multipoint — ${count} modèles | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil compatibles multipoint référencés sur EarbudsTimeline : ${count} modèles, toutes marques confondues.`,
  };
}

export default async function MultipointPage() {
  const [allModels, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const models = allModels.filter((m) => m.multipoint);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return (
    <TechHubPage
      eyebrow="Technologie"
      title="Écouteurs multipoint"
      intro={`${models.length} écouteurs référencés supportent le multipoint, chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. Le multipoint permet de rester connecté à deux appareils Bluetooth en même temps — un ordinateur et un téléphone, par exemple — et de basculer automatiquement de l'un à l'autre.`}
      models={models}
      brands={brands}
      breadcrumbItems={[
        { name: 'Accueil', url: '/' },
        { name: 'Technologies', url: '/technologies' },
        { name: 'Multipoint', url: '/technologies/multipoint' },
      ]}
    />
  );
}
