// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // ⚠️ `unoptimized: true` désactive l'optimiseur d'images payant de Vercel
    // (redimensionnement/conversion AVIF-WebP automatique) — posé en urgence
    // le 24/08/2026 suite à des 402 PAYMENT_REQUIRED /
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED : le quota gratuit du plan
    // Hobby (1000 images sources/mois) était dépassé, ce qui cassait toute
    // image jamais encore optimisée (les nouveaux écouteurs, une nouvelle
    // image d'article) tout en laissant fonctionner les images déjà en
    // cache — d'où le bug qui semblait n'affecter "que certaines" images.
    // Supabase Storage sert déjà les fichiers tels quels (pas de redimension-
    // nement/format auto le temps que ce flag est actif) — perte de perf
    // mineure mais acceptable le temps de régler le plan Vercel. À retirer
    // une fois passé sur un plan Vercel Pro (5000 images incluses,
    // dépassement facturé) ou une autre stratégie de redimensionnement mise
    // en place — le plan Hobby actuel interdit de toute façon l'usage
    // commercial (cf. politique d'usage équitable de Vercel), pertinent vu
    // l'intégration AdSense déjà en place.
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);