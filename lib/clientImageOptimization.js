const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;
const MAX_OUTPUT_BYTES = 500 * 1024;

function loadImage(file) {
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

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
}

export async function optimizeImageFile(file) {
  if (!file || !file.type?.startsWith('image/')) return file;

  // Do not re-process an already small WebP.
  if (file.type === 'image/webp' && file.size <= MAX_OUTPUT_BYTES) return file;

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Votre navigateur ne permet pas de traiter cette image.');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = WEBP_QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  if (!blob) return file;

  // If the result is still large, progressively lower quality rather than
  // sending the original multi-megabyte JPEG/PNG to Supabase.
  while (blob.size > MAX_OUTPUT_BYTES && quality > 0.55) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
    if (!blob) return file;
  }

  // Never replace a file with a larger result.
  if (blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}
