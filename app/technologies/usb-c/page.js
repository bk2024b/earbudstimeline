import { getAllEarbuds, getBrands } from '@/lib/queries';
import TechHubPage from '@/components/TechHubPage';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const models = await getAllEarbuds();
  const count = models.filter((m) => m.usb_c).length;
  return {
    ...canonicalFor('/technologies/usb-c'),
    title: `Écouteurs avec boîtier USB-C — ${count} modèles | EarbudsTimeline`,
    description: `Tous les écouteurs sans fil dont le boîtier de charge est en USB-C : ${count} modèles référencés sur EarbudsTimeline.`,
  };
}

export default async function UsbCPage() {
  const [allModels, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const models = allModels.filter((m) => m.usb_c);
  const brandCount = new Set(models.map((m) => m.brand_id)).size;

  return (
    <TechHubPage
      eyebrow="Technologie"
      title="Écouteurs avec boîtier USB-C"
      intro={`${models.length} écouteurs référencés se rechargent en USB-C, chez ${brandCount} marque${brandCount > 1 ? 's' : ''}. La plupart des fabricants ont abandonné le micro-USB et le Lightning au profit de l'USB-C depuis le début des années 2020.`}
      models={models}
      brands={brands}
      breadcrumbItems={[
        { name: 'Accueil', url: '/' },
        { name: 'Technologies', url: '/technologies' },
        { name: 'USB-C', url: '/technologies/usb-c' },
      ]}
    />
  );
}
