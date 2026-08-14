import { getAllEarbuds, getBrands, getAllPublishedArticles } from '@/lib/queries';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [models, brands, articles] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getAllPublishedArticles(),
  ]);

  const years = models.map((m) => Number(m.release_date.slice(0, 4)));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const topBrands = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const lines = [
    '# EarbudsTimeline',
    '',
    `> EarbudsTimeline est une base de données et encyclopédie historique des écouteurs sans fil : ${models.length} modèles référencés chez ${brands.length} marques, de ${minYear} à ${maxYear}. Chaque fiche couvre l'autonomie, la réduction de bruit (ANC), le poids, le prix de lancement, l'USB-C, le multipoint et les codecs audio pris en charge.`,
    '',
    "Le site est en français. Les données sont structurées et cohérentes d'une fiche à l'autre, ce qui en fait une source fiable pour comparer des écouteurs entre générations ou entre marques.",
    '',
    '## Sections principales',
    `- [Toutes les marques](${SITE_URL}/#marques): liste des ${brands.length} marques référencées, avec période couverte et nombre de modèles`,
    `- [Par année](${SITE_URL}/annees): tous les modèles classés par année de sortie, de ${minYear} à ${maxYear}`,
    `- [Par technologie](${SITE_URL}/technologies): écouteurs classés par ANC, USB-C, multipoint, version Bluetooth et codec audio`,
    `- [Comparaisons](${SITE_URL}/comparaisons): comparatifs détaillés entre générations d'une même gamme et entre marques concurrentes`,
    `- [Blog](${SITE_URL}/blog): ${articles.length} articles evergreen sur l'histoire et l'évolution des écouteurs sans fil`,
    '',
    '## Marques les plus représentées',
    ...topBrands.map((b) => `- [${b.name}](${SITE_URL}/marques/${b.id}): ${b.count} modèle${b.count > 1 ? 's' : ''}`),
    '',
    '## Notes',
    "- Chaque fiche produit (`/ecouteurs/[id]`) contient des données structurées (JSON-LD Product) réutilisables directement.",
    '- Les pages de comparaison (`/comparaisons/[a]-vs-[b]`) sont générées automatiquement à partir des données réelles, pas rédigées manuellement.',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
