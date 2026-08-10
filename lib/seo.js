export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://earbudstimeline.vercel.app';

export function absoluteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Balise canonical auto-référente — évite que Google traite des variantes
// d'URL (paramètres, ordre inversé, etc.) comme du contenu dupliqué.
export function canonicalFor(path) {
  return { alternates: { canonical: path } };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function buildProductJsonLd(model, brand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    sku: model.id,
    brand: { '@type': 'Brand', name: brand?.name || model.brand_id },
    releaseDate: model.release_date,
    description: model.tagline,
    image: model.image_url ? [model.image_url] : undefined,
    url: absoluteUrl(`/ecouteurs/${model.id}`),
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

export function buildArticleJsonLd(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    url: absoluteUrl(`/blog/${article.id}`),
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
