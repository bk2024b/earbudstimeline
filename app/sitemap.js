import { getAllEarbuds, getBrands, getAllPublishedArticles } from '@/lib/queries';
import { slugify } from '@/lib/slug';
import { getGenerationalPairs, getRivalPairs } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { getBluetoothVersionList, getCodecList } from '@/lib/tech';
import { SITE_URL } from '@/lib/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

// Génère une entrée par langue pour un même chemin (sans préfixe), avec hreflang croisé.
function localizedEntries(path, meta = {}) {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    },
    ...meta,
  }));
}

export default async function sitemap() {
  const [models, brands, articles] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getAllPublishedArticles(),
  ]);

  const staticPaths = [
    { path: '', priority: 1 },
    { path: '/comparaisons', priority: 0.7 },
    { path: '/comparer', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
    { path: '/annees', priority: 0.7 },
    { path: '/technologies', priority: 0.7 },
    { path: '/technologies/anc', priority: 0.7 },
    { path: '/technologies/usb-c', priority: 0.7 },
    { path: '/technologies/multipoint', priority: 0.7 },
  ];
  const staticRoutes = staticPaths.flatMap(({ path, priority }) =>
    localizedEntries(path, { changeFrequency: 'weekly', priority })
  );

  const brandRoutes = brands.flatMap((b) =>
    localizedEntries(`/marques/${b.id}`, { changeFrequency: 'weekly', priority: 0.8 })
  );

  const gammeKeys = new Set(models.map((m) => `${m.brand_id}::${slugify(m.gamme)}`));
  const gammeRoutes = [...gammeKeys].flatMap((key) => {
    const [brandId, gammeSlug] = key.split('::');
    return localizedEntries(`/marques/${brandId}/${gammeSlug}`, { changeFrequency: 'monthly', priority: 0.7 });
  });

  const yearRoutes = [...new Set(models.map((m) => Number(m.release_date.slice(0, 4))))].flatMap((y) =>
    localizedEntries(`/annees/${y}`, { changeFrequency: 'monthly', priority: 0.6 })
  );

  const pairs = [...getGenerationalPairs(models), ...getRivalPairs(models, 40)];
  const comparisonSlugs = new Set(pairs.map(({ a, b }) => buildComparisonSlug(a.id, b.id)));
  const comparisonRoutes = [...comparisonSlugs].flatMap((slug) =>
    localizedEntries(`/comparaisons/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  );

  const btRoutes = getBluetoothVersionList(models).flatMap((v) =>
    localizedEntries(`/technologies/bluetooth/${v.version}`, { changeFrequency: 'monthly', priority: 0.6 })
  );

  const codecRoutes = getCodecList(models).flatMap((c) =>
    localizedEntries(`/technologies/codecs/${c.slug}`, { changeFrequency: 'monthly', priority: 0.6 })
  );

  const modelRoutes = models.flatMap((m) =>
    localizedEntries(`/ecouteurs/${m.id}`, {
      lastModified: m.release_date,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  );

  // Chaque article n'existe que dans SA langue (slug propre par langue) — contrairement
  // aux autres contenus, on ne génère pas les deux locales pour le même id. Le hreflang
  // ne pointe vers l'autre langue que si une traduction publiée existe réellement.
  const byId = new Map(articles.map((a) => [a.id, a]));
  const articleRoutes = articles.map((a) => {
    const sibling =
      a.locale === 'en'
        ? (a.translation_of && byId.get(a.translation_of)) || null
        : articles.find((x) => x.translation_of === a.id) || null;

    const languages = { [a.locale]: `${SITE_URL}/${a.locale}/blog/${a.id}` };
    if (sibling) languages[sibling.locale] = `${SITE_URL}/${sibling.locale}/blog/${sibling.id}`;

    return {
      url: `${SITE_URL}/${a.locale}/blog/${a.id}`,
      alternates: { languages },
      lastModified: a.published_at,
      changeFrequency: 'monthly',
      priority: 0.6,
    };
  });

  return [
    ...staticRoutes,
    ...brandRoutes,
    ...gammeRoutes,
    ...yearRoutes,
    ...comparisonRoutes,
    ...btRoutes,
    ...codecRoutes,
    ...modelRoutes,
    ...articleRoutes,
  ];
}
