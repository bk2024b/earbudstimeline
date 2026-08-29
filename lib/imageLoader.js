// lib/imageLoader.js
//
// Loader `next/image` custom (voir `images.loader` dans next.config.mjs).
// Remplace `unoptimized: true` : au lieu de désactiver tout redimensionnement
// (une seule taille servie à tout le monde), on choisit parmi les variantes
// pré-générées par lib/storage.js / scripts/backfill-optimize-images.js
// (voir lib/imageVariants.js) celle qui couvre la largeur demandée par Next.
//
// Ne passe JAMAIS par /_next/image (l'optimiseur à la demande de Vercel, qui
// facture par image source et a causé les 402 PAYMENT_REQUIRED du 24/08) :
// on renvoie directement une URL Supabase Storage publique, servie telle
// quelle par le CDN Supabase.
//
// Sûr par construction : si une variante n'a pas encore été générée pour une
// image donnée (backfill pas encore passé dessus, ou image hébergée hors de
// notre bucket), on retombe sur l'URL canonique déjà stockée en DB — jamais
// de lien mort vers un fichier qui n'existe pas.

import { buildVariantUrl, nearestWidth } from './imageVariants';

let supabaseHost = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;
  }
} catch {
  // Pas bloquant : buildVariantUrl retombe sur une vérification par pathname
  // seul si on ne peut pas comparer le host.
}

export default function imageLoader({ src, width }) {
  const targetWidth = nearestWidth(width);
  return buildVariantUrl(src, targetWidth, supabaseHost);
}
