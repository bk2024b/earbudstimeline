import sharp from 'sharp';
import { getSupabaseAdmin } from './supabaseAdmin';
import { BUCKET, VARIANT_WIDTHS, variantStoragePath } from './imageVariants';

export async function uploadImage(file, folder) {
  if (!file || typeof file === 'string' || file.size === 0) return null;

  const supabase = getSupabaseAdmin();
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  // Variantes responsives (voir lib/imageVariants.js) : dérivées du fichier
  // qu'on vient d'uploader (déjà redimensionné à ~CANONICAL_WIDTH par
  // lib/clientImageOptimization.js côté navigateur avant l'envoi), donc pas
  // besoin de repartir d'un original plus lourd. Best-effort — une variante
  // qui échoue à générer ne doit pas faire échouer l'upload : le loader
  // (lib/imageLoader.js) retombe sur le fichier canonique si une variante
  // manque.
  await uploadVariants({ supabase, buffer, canonicalPath: path });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Génère et uploade, à partir du buffer déjà décodé du fichier canonique,
// chaque variante plus petite listée dans VARIANT_WIDTHS. Ignore les
// largeurs supérieures à l'image source (`withoutEnlargement`) — inutile de
// stocker une variante "800" identique au canonique si celui-ci ne fait que
// 500px de large.
async function uploadVariants({ supabase, buffer, canonicalPath }) {
  const results = await Promise.allSettled(
    VARIANT_WIDTHS.map(async (width) => {
      const resized = await sharp(buffer)
        .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();

      const variantPath = variantStoragePath(canonicalPath, width);
      const { error } = await supabase.storage.from(BUCKET).upload(variantPath, resized, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;
    })
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`uploadImage: ${failed.length}/${VARIANT_WIDTHS.length} variante(s) échouée(s) pour ${canonicalPath}`, failed[0].reason);
  }
}
