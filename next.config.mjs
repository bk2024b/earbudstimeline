// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Cluster Price/Budget : ces deux guides faisaient doublon d'intention
    // avec des pages déjà en place (cannibalisation SEO) et ont été retirés
    // de GUIDE_PAGES. Redirect 301 au lieu d'une simple suppression pour ne
    // pas perdre le jus SEO si l'une des deux URLs a déjà été explorée/indexée.
    return [
      {
        source: '/:locale(en|fr)/guides/best-wireless-earbuds-under-100',
        destination: '/:locale/guides/best-earbuds-under-100',
        permanent: true,
      },
      {
        source: '/:locale(en|fr)/guides/best-earbuds-150-to-250',
        destination: '/:locale/guides/best-premium-earbuds',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    // Images produits/articles hébergées sur Supabase Storage (bucket "media").
    // Wildcard sur *.supabase.co plutôt que le sous-domaine exact du projet,
    // pour ne rien casser si le projet Supabase change un jour.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Loader custom (lib/imageLoader.js) au lieu de l'optimiseur à la demande
    // de Vercel : celui-ci facturait par image source et avait déclenché des
    // 402 PAYMENT_REQUIRED le 24/08/2026 (quota gratuit du plan Hobby, 1000
    // images/mois, dépassé). Le loader sert à la place l'une des variantes
    // pré-générées à l'upload/au backfill (lib/imageVariants.js,
    // lib/storage.js, scripts/backfill-optimize-images.js) directement
    // depuis Supabase Storage — aucun appel à /_next/image, donc plus de
    // facturation Vercel liée aux images, tout en gardant un vrai srcset
    // responsive (le visiteur mobile ne télécharge plus l'image 1600px
    // prévue pour desktop).
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
    // Alignées sur les variantes réellement générées (voir VARIANT_WIDTHS /
    // CANONICAL_WIDTH dans lib/imageVariants.js) : pas la peine de faire
    // varier deviceSizes/imageSizes sur des paliers qu'on n'a pas produits,
    // le loader ne saurait de toute façon renvoyer qu'une de ces 4 tailles.
    deviceSizes: [400, 800, 1600],
    imageSizes: [200],
  },
};

export default withNextIntl(nextConfig);