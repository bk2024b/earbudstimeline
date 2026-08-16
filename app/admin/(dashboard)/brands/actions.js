'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';

export async function createBrand(formData) {
  const name = formData.get('name')?.toString().trim();
  const color = formData.get('color')?.toString().trim();
  const idRaw = formData.get('id')?.toString().trim();

  if (!name || !color) redirect('/admin/brands/new?error=missing');

  const id = slugify(idRaw || name);
  if (!id) redirect('/admin/brands/new?error=missing');

  let image_url = null;
  const file = formData.get('image');
  if (file && file.size > 0) {
    try {
      image_url = await uploadImage(file, 'brands');
    } catch (e) {
      redirect(`/admin/brands/new?error=${encodeURIComponent(e.message)}`);
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('brands').insert({ id, name, color, image_url });
  if (error) redirect(`/admin/brands/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/brands');
  revalidatePath('/');
  redirect('/admin/brands');
}

export async function updateBrand(id, formData) {
  const name = formData.get('name')?.toString().trim();
  const color = formData.get('color')?.toString().trim();

  if (!name || !color) redirect(`/admin/brands/${id}?error=missing`);

  const updates = { name, color };
  const file = formData.get('image');
  if (file && file.size > 0) {
    try {
      updates.image_url = await uploadImage(file, 'brands');
    } catch (e) {
      redirect(`/admin/brands/${id}?error=${encodeURIComponent(e.message)}`);
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('brands').update(updates).eq('id', id);
  if (error) redirect(`/admin/brands/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/brands');
  revalidatePath(`/marques/${id}`);
  revalidatePath('/');
  redirect('/admin/brands');
}

export async function deleteBrand(id) {
  const supabase = getSupabaseAdmin();
  // earbuds.brand_id -> brands(id) ON DELETE CASCADE : supprime aussi tous les
  // écouteurs de cette marque. Le bouton de suppression prévient l'admin avant.
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) redirect(`/admin/brands?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/brands');
  revalidatePath('/');
  redirect('/admin/brands');
}

// Appelée depuis le composant client pour l'import par lot de marques
export async function importBrandsBatch(payload) {
  const rawRows = Array.isArray(payload?.rawRows) ? payload.rawRows : [];
  const overwrite = Boolean(payload?.overwrite);
  if (rawRows.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('brands').select('id');
  const existingIds = new Set((existing || []).map((b) => b.id));

  const results = [];
  for (const raw of rawRows) {
    const name = raw.name?.toString().trim();
    if (!name) {
      results.push({ name: '', ok: false, error: 'Nom de marque manquant' });
      continue;
    }

    const id = slugify(raw.id?.toString().trim() || name);
    const color = raw.color?.toString().trim() || '#6C8CFF';
    const isDuplicate = existingIds.has(id);

    if (isDuplicate && !overwrite) {
      results.push({
        id,
        name,
        ok: false,
        error: 'Marque déjà existante (ignorée)',
      });
      continue;
    }

    try {
      let error;
      if (isDuplicate) {
        ({ error } = await supabase.from('brands').update({ name, color }).eq('id', id));
      } else {
        ({ error } = await supabase.from('brands').insert({ id, name, color }));
      }

      if (error) throw error;
      existingIds.add(id);
      results.push({ id, name, ok: true, updated: isDuplicate });
    } catch (e) {
      results.push({ id, name, ok: false, error: e.message });
    }
  }

  revalidatePath('/admin/brands');
  revalidatePath('/');
  return results;
}

