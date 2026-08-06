'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';

function parseEarbudForm(formData) {
  const num = (key) => {
    const v = formData.get(key);
    return v === null || v === '' ? null : Number(v);
  };
  return {
    brand_id: formData.get('brand_id')?.toString() || '',
    gamme: formData.get('gamme')?.toString().trim() || '',
    name: formData.get('name')?.toString().trim() || '',
    tagline: formData.get('tagline')?.toString().trim() || '',
    release_date: formData.get('release_date')?.toString() || '',
    price: num('price'),
    marquant: formData.get('marquant') === 'on',
    anc: formData.get('anc') === 'on',
    battery_bud_h: num('battery_bud_h'),
    battery_case_h: num('battery_case_h'),
    weight_g: num('weight_g'),
    water_rating: formData.get('water_rating')?.toString().trim() || 'Non résistant',
    chip: formData.get('chip')?.toString().trim() || '—',
    bluetooth: formData.get('bluetooth')?.toString().trim() || '',
  };
}

function isValid(data) {
  return Boolean(
    data.brand_id &&
      data.gamme &&
      data.name &&
      data.tagline &&
      data.release_date &&
      data.battery_bud_h !== null &&
      data.battery_case_h !== null &&
      data.weight_g !== null &&
      data.bluetooth
  );
}

export async function createEarbud(formData) {
  const data = parseEarbudForm(formData);
  if (!isValid(data)) redirect('/admin/earbuds/new?error=missing');

  const idRaw = formData.get('id')?.toString().trim();
  const id = slugify(idRaw || `${data.brand_id}-${data.name}`);
  if (!id) redirect('/admin/earbuds/new?error=missing');

  let image_url = null;
  const file = formData.get('image');
  if (file && file.size > 0) {
    try {
      image_url = await uploadImage(file, 'earbuds');
    } catch (e) {
      redirect(`/admin/earbuds/new?error=${encodeURIComponent(e.message)}`);
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds').insert({ id, ...data, image_url });
  if (error) redirect(`/admin/earbuds/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/earbuds');
  revalidatePath('/');
  revalidatePath(`/marques/${data.brand_id}`);
  redirect('/admin/earbuds');
}

export async function updateEarbud(id, formData) {
  const data = parseEarbudForm(formData);
  if (!isValid(data)) redirect(`/admin/earbuds/${id}?error=missing`);

  const file = formData.get('image');
  if (file && file.size > 0) {
    try {
      data.image_url = await uploadImage(file, 'earbuds');
    } catch (e) {
      redirect(`/admin/earbuds/${id}?error=${encodeURIComponent(e.message)}`);
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds').update(data).eq('id', id);
  if (error) redirect(`/admin/earbuds/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/earbuds');
  revalidatePath('/');
  revalidatePath(`/marques/${data.brand_id}`);
  revalidatePath(`/ecouteurs/${id}`);
  redirect('/admin/earbuds');
}

// Appelée directement depuis le composant client (pas de <form action>), donc pas de redirect().
// files[i] est associé à earbudIds[i] (même ordre d'insertion dans le FormData).
export async function bulkUploadImages(formData) {
  const files = formData.getAll('files');
  const earbudIds = formData.getAll('earbudIds');
  const supabase = getSupabaseAdmin();
  const brandIds = new Set();

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const earbudId = earbudIds[i]?.toString();
    if (!file || file.size === 0 || !earbudId) continue;

    try {
      const image_url = await uploadImage(file, 'earbuds');
      const { data, error } = await supabase
        .from('earbuds')
        .update({ image_url })
        .eq('id', earbudId)
        .select('brand_id')
        .single();
      if (error) throw error;
      if (data?.brand_id) brandIds.add(data.brand_id);
      results.push({ filename: file.name, earbudId, ok: true });
    } catch (e) {
      results.push({ filename: file.name, earbudId, ok: false, error: e.message });
    }
  }

  revalidatePath('/admin/earbuds');
  revalidatePath('/');
  brandIds.forEach((bId) => revalidatePath(`/marques/${bId}`));

  return results;
}

export async function deleteEarbud(id, brandId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds').delete().eq('id', id);
  if (error) redirect(`/admin/earbuds?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/admin/earbuds');
  revalidatePath('/');
  if (brandId) revalidatePath(`/marques/${brandId}`);
  redirect('/admin/earbuds');
}
