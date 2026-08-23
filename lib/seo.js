import { displayTagline } from './format';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earbudstimeline.com').replace(/\/$/, '');

export function absoluteUrl(path = '', locale) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return locale ? `${SITE_URL}/${locale}${p}` : `${SITE_URL}${p}`;
}

// Balise canonical auto-référente + hreflang complet (en/fr/x-default) — évite le contenu
// dupliqué et indique à Google les paires de pages traduites entre elles.
// `localizedPath` inclut déjà le préfixe de langue, ex. "/en/ecouteurs/xxx".
export function canonicalFor(localizedPath) {
  const cleanPath = localizedPath.startsWith('/') ? localizedPath : `/${localizedPath}`;
  const rest = cleanPath.replace(/^\/(en|fr)/, '');
  return {
    alternates: {
      canonical: cleanPath,
      languages: {
        en: `/en${rest}`,
        fr: `/fr${rest}`,
        'x-default': `/en${rest}`,
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

// Balisage des pages "hub"/listing (marque, gamme, comparateur, année, techno).
// CollectionPage + mainEntity/ItemList explicite le rôle de la page comme
// collection d'entités liées — c'est ce que Google et les moteurs IA
// s'appuient dessus pour comprendre les relations marque → produit → gamme
// plutôt que de traiter chaque page comme un contenu isolé.
// `items` : [{ url, name }] déjà triés dans l'ordre d'affichage voulu.
export function buildCollectionPageJsonLd({ name, description, url, locale, items }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description ? { description } : {}),
    url: absoluteUrl(url, locale),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(item.url, locale),
        name: item.name,
      })),
    },
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
