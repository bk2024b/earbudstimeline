import { getAllEarbuds, getBrands, getPublishedArticles } from '@/lib/queries';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap() {
  const [models, brands, articles] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getPublishedArticles(),
  ]);

  const staticRoutes = ['', '/comparaisons', '/comparer', '/blog'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${SITE_URL}/marques/${b.id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
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

  return [...staticRoutes, ...brandRoutes, ...modelRoutes, ...articleRoutes];
}
