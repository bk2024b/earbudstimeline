import { getSupabaseAdmin } from './supabaseAdmin';

const BUCKET = 'media';

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

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
