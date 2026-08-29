import { getAllEarbuds, getBrands } from '@/lib/queries';
import { buildBrandJourneys } from '@/lib/brandJourney';
import { canonicalFor, JsonLd } from '@/lib/seo';
import ExploreClientWrapper from '@/components/explore/ExploreClientWrapper';

// Same revalidate window as the rest of the catalog-driven pages (lib/queries.js
// caches getAllEarbuds()/getBrands() for 1h already; this just matches ISR to it).
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn
    ? 'Explore — The Wireless Earbuds Universe | EarbudsTimeline'
    : "Explore — L'univers des écouteurs sans fil | EarbudsTimeline";
  const description = isEn
    ? 'An immersive way to travel through the history of every wireless earbuds brand — from their very first model to their latest.'
    : "Une manière immersive de parcourir l'histoire de chaque marque d'écouteurs sans fil — de leur tout premier modèle au plus récent.";
  return {
    title,
    description,
    ...canonicalFor(`/${locale}/explore`),
    openGraph: { title, description },
  };
}

export default async function ExplorePage({ params }) {
  const { locale } = await params;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const journeys = buildBrandJourneys(models, brands);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'EarbudsTimeline Explore',
          applicationCategory: 'EntertainmentApplication',
          operatingSystem: 'All',
          description:
            locale === 'en'
              ? 'Immersive brand-by-brand journey through the real release history of wireless earbuds.'
              : "Voyage immersif marque par marque à travers l'historique réel des sorties d'écouteurs sans fil.",
        }}
      />
      <ExploreClientWrapper journeys={journeys} locale={locale} />
    </>
  );
}
