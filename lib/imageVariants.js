// lib/imageVariants.js
//
// Convention de nommage partagée pour les images responsives stockées sur
// Supabase Storage : en plus du fichier "canonique" (celui déjà produit par
// lib/clientImageOptimization.js / scripts/backfill-optimize-images.js —
// max 1600px, WebP), on génère quelques variantes plus petites nommées
// `<nom>-<largeur>.webp` dans le même dossier :
//
//   earbuds/abc123.webp        (canonique, ~1600px — c'est la valeur stockée en DB)
//   earbuds/abc123-800.webp
//   earbuds/abc123-400.webp
//   earbuds/abc123-200.webp
//
// Pas de migration de schéma : `image_url` / `cover_image_url` continuent de
// pointer vers le fichier canonique comme avant, les variantes se déduisent
// par nom de fichier (voir buildVariantUrl / CANONICAL_WIDTH). Toute image
// qui n'a pas encore de variantes (pas encore backfillée, ou hébergée hors
// de notre bucket) retombe simplement sur le fichier canonique — jamais de
// 404 : lib/imageLoader.js ne sert une variante que si elle a été générée.

const BUCKET = 'media';

// Largeur du fichier canonique (celui référencé en DB) — doit rester alignée
// avec MAX_DIMENSION dans lib/clientImageOptimization.js et
// scripts/backfill-optimize-images.js.
export const CANONICAL_WIDTH = 1600;

// Variantes générées en plus du canonique, de la plus grande à la plus
// petite. Choisies pour couvrir les usages réels du site : ~800 pour les
// covers d'articles / héros (jusqu'à 900px CSS affichés en pleine largeur),
// ~400 pour les cartes de grille produit, ~200 pour les vignettes/badges.
export const VARIANT_WIDTHS = [800, 400, 200];

// Toutes les largeurs disponibles, triées décroissant (canonique inclus).
export const ALL_WIDTHS = [CANONICAL_WIDTH, ...VARIANT_WIDTHS];

export function isOwnStorageUrl(url, supabaseHost) {
  try {
    const u = new URL(url);
    if (supabaseHost && u.host !== supabaseHost) return false;
    return u.pathname.includes(`/storage/v1/object/public/${BUCKET}/`);
  } catch {
    return false;
  }
}

export function storagePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
}

// `earbuds/abc123.webp` → `{ dir: 'earbuds', base: 'abc123', ext: 'webp' }`
export function parseStoragePath(storagePath) {
  const slash = storagePath.lastIndexOf('/');
  const dir = slash === -1 ? '' : storagePath.slice(0, slash);
  const file = slash === -1 ? storagePath : storagePath.slice(slash + 1);
  const dot = file.lastIndexOf('.');
  if (dot === -1) return { dir, base: file, ext: '' };
  return { dir, base: file.slice(0, dot), ext: file.slice(dot + 1) };
}

// Chemin storage d'une variante donnée pour un chemin canonique donné.
// width === CANONICAL_WIDTH renvoie le chemin canonique lui-même (inchangé).
export function variantStoragePath(canonicalStoragePath, width) {
  const { dir, base, ext } = parseStoragePath(canonicalStoragePath);
  const file = width === CANONICAL_WIDTH ? `${base}.${ext}` : `${base}-${width}.${ext}`;
  return dir ? `${dir}/${file}` : file;
}

// Reconstruit l'URL publique Supabase Storage d'une variante à partir de
// l'URL canonique (celle stockée en DB) et d'une largeur cible.
export function buildVariantUrl(canonicalUrl, width, supabaseHost) {
  if (!isOwnStorageUrl(canonicalUrl, supabaseHost)) return canonicalUrl;
  const storagePath = storagePathFromUrl(canonicalUrl);
  if (!storagePath) return canonicalUrl;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const prefix = canonicalUrl.slice(0, canonicalUrl.indexOf(marker) + marker.length);
  return `${prefix}${variantStoragePath(storagePath, width)}`;
}

// Choisit la plus petite largeur disponible qui couvre la largeur demandée
// (comme le ferait l'optimiseur d'images Next natif), avec repli sur le
// canonique si la demande dépasse tout ce qu'on a généré.
export function nearestWidth(requestedWidth) {
  const candidate = ALL_WIDTHS.slice().sort((a, b) => a - b).find((w) => w >= requestedWidth);
  return candidate || CANONICAL_WIDTH;
}

export { BUCKET };
