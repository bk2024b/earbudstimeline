'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';

export async function createBrand(formData) {
  const name = formData.get('name')?.toString().trim();
  const color = formData.get('color')?.toString().trim();
  const idRaw = formData.get('id')?.toString().trim();

  if (!name || !color) redirect('/admin/brands/new?error=missing');

  const id = slugify(idRaw || name);
  if (!id) redirect('/admin/brands/new?error=missing');

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('brands').insert({ id, name, color });
  if (error) redirect(`/admin/brands/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/brands');
  revalidatePath('/');
  redirect('/admin/brands');
}

export async function updateBrand(id, formData) {
  const name = formData.get('name')?.toString().trim();
  const color = formData.get('color')?.toString().trim();

  if (!name || !color) redirect(`/admin/brands/${id}?error=missing`);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('brands').update({ name, color }).eq('id', id);
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
