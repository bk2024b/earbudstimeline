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
    // Product/article images are stored in Supabase Storage and optimized by
    // the Cloudflare image worker instead of Vercel Image Optimization.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.js',
  },
};

export default withNextIntl(nextConfig);
