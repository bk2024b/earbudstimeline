import { displayTagline } from './format';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://earbudstimeline.vercel.app';

export function absoluteUrl(path = '', locale) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return locale ? `${SITE_URL}/${locale}${p}` : `${SITE_URL}${p}`;
}

// Balise canonical auto-référente + hreflang complet (en/fr) — évite le contenu
// dupliqué et indique à Google les paires de pages traduites entre elles.
// `localizedPath` inclut déjà le préfixe de langue, ex. "/en/ecouteurs/xxx".
export function canonicalFor(localizedPath) {
  const rest = localizedPath.replace(/^\/(en|fr)/, '');
  return {
    alternates: {
      canonical: localizedPath,
      languages: {
        en: `/en${rest}`,
        fr: `/fr${rest}`,
      },
    },
  };
}

export function buildBreadcrumbJsonLd(items, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url, locale),
    })),
  };
}

export function buildProductJsonLd(model, brand, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    sku: model.id,
    brand: { '@type': 'Brand', name: brand?.name || model.brand_id },
    releaseDate: model.release_date,
    description: displayTagline(model, locale),
    image: model.image_url ? [model.image_url] : undefined,
    url: absoluteUrl(`/ecouteurs/${model.id}`, locale),
    ...(model.price
      ? {
          offers: {
            '@type': 'Offer',
            price: model.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}

export function buildArticleJsonLd(article, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    url: absoluteUrl(`/blog/${article.id}`, locale),
    author: {
      '@type': 'Organization',
      name: 'EarbudsTimeline',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EarbudsTimeline',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo-icon.png'),
      },
    },
  };
}

// Composant utilitaire pour injecter un bloc JSON-LD dans une page (server component).
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
