import { getAllEarbuds, getBrands, getAllPublishedArticles } from '@/lib/queries';
import { slugify } from '@/lib/slug';
import { getGenerationalPairs, getRivalPairs, findRival } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { getBluetoothVersionList, getCodecList } from '@/lib/tech';
import { SITE_URL } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import { GUIDE_PAGES } from '@/lib/guidePages';

// Guides "meilleurs écouteurs pour X" écrits à la main, avant l'introduction de GUIDE_PAGES
// (généré depuis la DB). Ce sont de vraies pages (app/[locale]/guides/<slug>/page.js), linkées
// depuis /guides, mais jamais listées ici — Ahrefs les remontait en "indexable mais absent du sitemap".
const LEGACY_GUIDE_SLUGS = [
  'best-battery-life-earbuds',
  'best-budget-earbuds',
  'best-earbuds-for-android',
  'best-earbuds-for-audiophiles',
  'best-earbuds-for-bass',
  'best-earbuds-for-calls',
  'best-earbuds-for-commuting',
  'best-earbuds-for-cycling',
  'best-earbuds-for-gaming',
  'best-earbuds-for-gym',
  'best-earbuds-for-iphone',
  'best-earbuds-for-large-ears',
  'best-earbuds-for-long-flights',
  'best-earbuds-for-music',
  'best-earbuds-for-outdoor-use',
  'best-earbuds-for-podcasts',
  'best-earbuds-for-running',
  'best-earbuds-for-sleep',
  'best-earbuds-for-small-ears',
  'best-earbuds-for-sport',
  'best-earbuds-for-students',
  'best-earbuds-for-travel',
  'best-earbuds-for-walking',
  'best-earbuds-for-working',
  'best-earbuds-under-100',
  'best-earbuds-under-150',
  'best-earbuds-under-200',
  'best-earbuds-under-50',
  'best-earbuds-under-75',
  'best-noise-cancelling-earbuds',
  'best-wireless-earbuds',
];

export const revalidate = 3600;

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
    { path: '/trouver-mes-ecouteurs', priority: 0.95 },
    { path: '/ecouteurs', priority: 0.85 },
    { path: '/marques', priority: 0.8 },
    { path: '/timeline', priority: 0.8 },
    { path: '/guides', priority: 0.75 },
    { path: '/comparaisons', priority: 0.7 },
    { path: '/comparer', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
    { path: '/annees', priority: 0.7 },
    { path: '/technologies', priority: 0.7 },
    { path: '/technologies/anc', priority: 0.7 },
    { path: '/technologies/usb-c', priority: 0.7 },
    { path: '/technologies/multipoint', priority: 0.7 },
    { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
  ];
  const staticRoutes = staticPaths.flatMap(({ path, priority, changeFrequency = 'weekly' }) => localizedEntries(path, { changeFrequency, priority }));
  const guideRoutes = GUIDE_PAGES.flatMap((guide) =>
    localizedEntries(`/guides/${guide.slug}`, { changeFrequency: 'weekly', priority: guide.priority || 0.7 })
  );
  const legacyGuideRoutes = LEGACY_GUIDE_SLUGS.flatMap((slug) =>
    localizedEntries(`/guides/${slug}`, { changeFrequency: 'monthly', priority: 0.65 })
  );

  const brandRoutes = brands.flatMap((b) => localizedEntries(`/marques/${b.id}`, { changeFrequency: 'weekly', priority: 0.8 }));
  const gammeKeys = new Set(models.map((m) => `${m.brand_id}::${slugify(m.gamme)}`));
  const gammeRoutes = [...gammeKeys].flatMap((key) => {
    const [brandId, gammeSlug] = key.split('::');
    return localizedEntries(`/marques/${brandId}/${gammeSlug}`, { changeFrequency: 'monthly', priority: 0.7 });
  });
  const yearRoutes = [...new Set(models.map((m) => Number(m.release_date.slice(0, 4))))].flatMap((y) => localizedEntries(`/annees/${y}`, { changeFrequency: 'monthly', priority: 0.6 }));
  // getRivalPairs(40) ne couvre qu'un échantillon global — chaque page modèle linke en réalité
  // vers SON rival (findRival), donc on l'ajoute explicitement pour fermer l'écart avec ce qui
  // est vraiment cliquable sur le site (source du "indexable page not in sitemap" côté comparaisons).
  const modelRivalPairs = models
    .map((m) => {
      const rival = findRival(m, models);
      return rival ? { a: m, b: rival } : null;
    })
    .filter(Boolean);
  const pairs = [...getGenerationalPairs(models), ...getRivalPairs(models, 40), ...modelRivalPairs];
  const comparisonSlugs = new Set(pairs.map(({ a, b }) => buildComparisonSlug(a.id, b.id)));
  const comparisonRoutes = [...comparisonSlugs].flatMap((slug) => localizedEntries(`/comparaisons/${slug}`, { changeFrequency: 'monthly', priority: 0.7 }));
  const btRoutes = getBluetoothVersionList(models).flatMap((v) => localizedEntries(`/technologies/bluetooth/${v.version}`, { changeFrequency: 'monthly', priority: 0.6 }));
  const codecRoutes = getCodecList(models).flatMap((c) => localizedEntries(`/technologies/codecs/${c.slug}`, { changeFrequency: 'monthly', priority: 0.6 }));
  const modelRoutes = models.flatMap((m) => localizedEntries(`/ecouteurs/${m.id}`, { lastModified: m.release_date, changeFrequency: 'monthly', priority: 0.9 }));

  const byId = new Map(articles.map((a) => [a.id, a]));
  const articleRoutes = articles.map((a) => {
    const sibling = a.locale === 'en'
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

  return [...staticRoutes, ...guideRoutes, ...legacyGuideRoutes, ...brandRoutes, ...gammeRoutes, ...yearRoutes, ...comparisonRoutes, ...btRoutes, ...codecRoutes, ...modelRoutes, ...articleRoutes];
}
