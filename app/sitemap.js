import { getAllEarbuds, getBrands, getPublishedArticles } from '@/lib/queries';
import { slugify } from '@/lib/slug';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap() {
  const [models, brands, articles] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getPublishedArticles(),
  ]);

  const staticRoutes = ['', '/comparaisons', '/comparer', '/blog', '/annees'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${SITE_URL}/marques/${b.id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const gammeKeys = new Set(models.map((m) => `${m.brand_id}::${slugify(m.gamme)}`));
  const gammeRoutes = [...gammeKeys].map((key) => {
    const [brandId, gammeSlug] = key.split('::');
    return {
      url: `${SITE_URL}/marques/${brandId}/${gammeSlug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  const yearRoutes = [...new Set(models.map((m) => Number(m.release_date.slice(0, 4))))].map((y) => ({
    url: `${SITE_URL}/annees/${y}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const pairs = [...getGenerationalPairs(models), ...getRivalPairs(models, 40)];
  const comparisonSlugs = new Set(pairs.map(({ a, b }) => buildComparisonSlug(a.id, b.id)));
  const comparisonRoutes = [...comparisonSlugs].map((slug) => ({
    url: `${SITE_URL}/comparaisons/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const modelRoutes = models.map((m) => ({
    url: `${SITE_URL}/ecouteurs/${m.id}`,
    lastModified: m.release_date,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${SITE_URL}/blog/${a.id}`,
    lastModified: a.published_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...brandRoutes, ...gammeRoutes, ...yearRoutes, ...comparisonRoutes, ...modelRoutes, ...articleRoutes];
}
