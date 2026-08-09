import { notFound } from 'next/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const version = params.version;
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.bluetooth === version).length;
  if (count === 0) return { title: 'Version Bluetooth introuvable — EarbudsTimeline' };

  return {
    title: `Écouteurs Bluetooth ${version} — ${count} modèles | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil équipés du Bluetooth ${version} référencés sur EarbudsTimeline : ${count} modèles, toutes marques confondues.`,
  };
}

export default async function BluetoothVersionPage({ params }) {
  const version = params.version;
  const [allModels, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const models = allModels.filter((m) => m.bluetooth === version);
  if (models.length === 0) notFound();

  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return (
    <TechHubPage
      eyebrow="Technologie"
      title={`Écouteurs Bluetooth ${version}`}
      intro={`${models.length} écouteurs référencés utilisent le Bluetooth ${version}, chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. La version Bluetooth influence la portée, la stabilité de la connexion et parfois la consommation énergétique du casque.`}
      models={models}
      brands={brands}
      breadcrumbItems={[
        { name: 'Accueil', url: '/' },
        { name: 'Technologies', url: '/technologies' },
        { name: `Bluetooth ${version}`, url: `/technologies/bluetooth/${version}` },
      ]}
    />
  );
}
