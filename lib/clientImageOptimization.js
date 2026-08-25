const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;
const MAX_OUTPUT_BYTES = 500 * 1024;
const MIN_QUALITY = 0.55;
const QUALITY_STEP = 0.08;

// Résultat mis en cache (une fois par session navigateur) : ce navigateur
// sait-il réellement encoder du WebP via canvas.toBlob, ou se contente-t-il
// de retourner un PNG silencieusement (comportement de repli de certains
// vieux moteurs) ? On ne veut pas le découvrir après coup sur un fichier
// utilisateur.
let webpSupportPromise = null;
function supportsWebpEncoding() {
  if (!webpSupportPromise) {
    webpSupportPromise = new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob((blob) => resolve(!!blob && blob.type === 'image/webp'), 'image/webp', 0.8);
    });
  }
  return webpSupportPromise;
}

// Décodage + correction d'orientation EXIF en une passe. Les photos prises
// depuis un téléphone embarquent presque toujours un tag EXIF d'orientation ;
// un <img> affiché dans le DOM le respecte automatiquement, mais un dessin
// canvas via new Image()+drawImage ne le garantit pas selon les moteurs.
// createImageBitmap({ imageOrientation: 'from-image' }) est la façon fiable
// et standard de récupérer des pixels déjà correctement orientés.
async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Certains formats/navigateurs peuvent refuser createImageBitmap
      // (ex. anciens Safari sur certains formats) — on retombe sur <img>.
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire cette image.'));
    };
    img.src = url;
  });
}

function sourceDimensions(source) {
  // HTMLImageElement expose naturalWidth/Height, ImageBitmap expose width/height.
  return {
    width: source.naturalWidth ?? source.width,
    height: source.naturalHeight ?? source.height,
  };
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Redimensionne et compresse une image côté client avant upload vers
 * Supabase Storage — évite d'envoyer des photos brutes de plusieurs Mo
 * (et l'attente réseau qui va avec) depuis l'admin.
 *
 * @param {File} file
 * @param {{ maxDimension?: number, quality?: number, maxBytes?: number }} [options]
 *   Permet à un appelant (ex. import en masse) d'ajuster le compromis
 *   taille/qualité sans dupliquer la logique. Les valeurs par défaut
 *   reproduisent le comportement historique.
 */
export async function optimizeImageFile(file, options = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const maxDimension = options.maxDimension ?? MAX_DIMENSION;
  const maxBytes = options.maxBytes ?? MAX_OUTPUT_BYTES;
  const startQuality = options.quality ?? WEBP_QUALITY;

  // Ne pas retraiter un WebP déjà petit.
  if (file.type === 'image/webp' && file.size <= maxBytes) return file;

  const canEncodeWebp = await supportsWebpEncoding();
  // Repli JPEG si le navigateur ne sait pas encoder de WebP via canvas
  // (silencieusement — mieux vaut un JPEG compressé qu'un PNG source non
  // retouché envoyé tel quel).
  const outputMime = canEncodeWebp ? 'image/webp' : 'image/jpeg';
  const outputExt = canEncodeWebp ? 'webp' : 'jpg';

  let source;
  try {
    source = await decodeImage(file);
  } catch {
    return file;
  }

  const { width: srcWidth, height: srcHeight } = sourceDimensions(source);
  const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    source.close?.();
    throw new Error('Votre navigateur ne permet pas de traiter cette image.');
  }
  if (!canEncodeWebp) {
    // Le JPEG n'a pas de canal alpha : fond blanc pour éviter un rendu noir
    // sur les PNG transparents (logos de marque notamment).
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(source, 0, 0, width, height);
  source.close?.(); // libère la mémoire de l'ImageBitmap dès que possible

  let quality = startQuality;
  let blob = await canvasToBlob(canvas, outputMime, quality);
  if (!blob) return file;

  // Si le résultat est encore volumineux, on réduit la qualité par paliers
  // plutôt que d'envoyer le JPEG/PNG original de plusieurs Mo à Supabase.
  while (blob.size > maxBytes && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToBlob(canvas, outputMime, quality);
    if (!blob) return file;
  }

  // Ne jamais remplacer un fichier par un résultat plus lourd.
  if (blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.${outputExt}`, {
    type: outputMime,
    lastModified: Date.now(),
  });
}
