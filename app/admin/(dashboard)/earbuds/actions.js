'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';
import { validateCsvRow } from '@/lib/earbudsCsv';
import { computeQualityScore } from '@/lib/qualityScore';

function parseEarbudForm(formData) {
  const num = (key) => {
    const v = formData.get(key);
    return v === null || v === '' ? null : Number(v);
  };
  const str = (key) => formData.get(key)?.toString().trim() || null;
  const codecsList = (key) => {
    const raw = str(key);
    return raw ? raw.split(',').map((c) => c.trim()).filter(Boolean) : null;
  };

  return {
    brand_id: formData.get('brand_id')?.toString() || '',
    gamme: formData.get('gamme')?.toString().trim() || '',
    name: formData.get('name')?.toString().trim() || '',
    tagline: formData.get('tagline')?.toString().trim() || '',
    tagline_en: formData.get('tagline_en')?.toString().trim() || null,
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
    usb_c: formData.get('usb_c') === 'on',
    multipoint: formData.get('multipoint') === 'on',
    codec: formData.get('codec')?.toString().trim() || '—',
    buy_url: formData.get('buy_url')?.toString().trim() || null,
    family: str('family'),
    generation: str('generation'),
    variant: str('variant'),
    announcement_date: str('announcement_date'),
    status: str('status') || 'released',
    type: str('type'),
    transparency: formData.get('transparency') === 'on',
    codecs: codecsList('codecs'),
    charging_time_h: num('charging_time_h'),
    wireless_charging: formData.get('wireless_charging') === 'on',
    microphones: str('microphones'),
    spatial_audio: formData.get('spatial_audio') === 'on',
    ecosystem: str('ecosystem'),
    app: str('app'),
    source_primary: str('source_primary'),
    source_secondary: str('source_secondary'),
    source_checked_at: str('source_checked_at'),
    data_confidence: str('data_confidence'),
    notes: str('notes'),
  };
}

function isValid(data) {
  return Boolean(data.brand_id && data.gamme && data.name && data.tagline && data.release_date && data.battery_bud_h !== null && data.battery_case_h !== null && data.weight_g !== null && data.bluetooth);
}

function revalidateEarbudCaches(brandId, earbudId) {
  revalidateTag('earbuds-all');
  revalidateTag('earbuds-search-catalog');
  revalidateTag('brands-all');
  if (brandId) {
    revalidateTag('earbuds-brand', brandId);
    revalidateTag('brand', brandId);
  }
  if (earbudId) revalidateTag('earbud', earbudId);

  revalidatePath('/admin');
  revalidatePath('/admin/earbuds');
  revalidatePath('/admin/brands');
  revalidatePath('/');
  revalidatePath('/fr');
  revalidatePath('/en');
  revalidatePath('/fr/comparer');
  revalidatePath('/en/comparer');
  revalidatePath('/fr/comparaisons');
  revalidatePath('/en/comparaisons');
  revalidatePath('/fr/annees');
  revalidatePath('/en/annees');
  revalidatePath('/fr/technologies');
  revalidatePath('/en/technologies');
  if (brandId) {
    revalidatePath(`/fr/marques/${brandId}`);
    revalidatePath(`/en/marques/${brandId}`);
    revalidatePath(`/marques/${brandId}`);
  }
  if (earbudId) {
    revalidatePath(`/fr/ecouteurs/${earbudId}`);
    revalidatePath(`/en/ecouteurs/${earbudId}`);
    revalidatePath(`/ecouteurs/${earbudId}`);
  }
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
    try { image_url = await uploadImage(file, 'earbuds'); }
    catch (e) { redirect(`/admin/earbuds/new?error=${encodeURIComponent(e.message)}`); }
  }
  data.image_url = image_url;
  data.image_count = image_url ? 1 : 0;
  Object.assign(data, computeQualityScore(data));
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds').insert({ id, ...data });
  if (error) redirect(`/admin/earbuds/new?error=${encodeURIComponent(error.message)}`);
  revalidateEarbudCaches(data.brand_id, id);
  redirect('/admin/earbuds');
}

export async function updateEarbud(id, formData) {
  const data = parseEarbudForm(formData);
  if (!isValid(data)) redirect(`/admin/earbuds/${id}?error=missing`);
  const supabase = getSupabaseAdmin();
  const file = formData.get('image');
  if (file && file.size > 0) {
    try { data.image_url = await uploadImage(file, 'earbuds'); data.image_count = 1; }
    catch (e) { redirect(`/admin/earbuds/${id}?error=${encodeURIComponent(e.message)}`); }
  } else {
    const { data: existing } = await supabase.from('earbuds').select('image_url').eq('id', id).single();
    data.image_url = existing?.image_url ?? null;
    data.image_count = data.image_url ? 1 : 0;
  }
  Object.assign(data, computeQualityScore(data));
  const { error } = await supabase.from('earbuds').update(data).eq('id', id);
  if (error) redirect(`/admin/earbuds/${id}?error=${encodeURIComponent(error.message)}`);
  revalidateEarbudCaches(data.brand_id, id);
  redirect('/admin/earbuds');
}

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
      const { data: current } = await supabase.from('earbuds').select('*').eq('id', earbudId).single();
      const patch = { image_url, image_count: 1, ...computeQualityScore({ ...current, image_url }) };
      const { data, error } = await supabase.from('earbuds').update(patch).eq('id', earbudId).select('brand_id').single();
      if (error) throw error;
      if (data?.brand_id) brandIds.add(data.brand_id);
      results.push({ filename: file.name, earbudId, ok: true });
    } catch (e) { results.push({ filename: file.name, earbudId, ok: false, error: e.message }); }
  }
  brandIds.forEach((bId) => revalidateEarbudCaches(bId));
  if (brandIds.size === 0) revalidateEarbudCaches();
  return results;
}

export async function importEarbudsCsv(payload) {
  const rawRows = Array.isArray(payload?.rawRows) ? payload.rawRows : [];
  const overwrite = Boolean(payload?.overwrite);
  if (rawRows.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const [{ data: brands }, { data: existing }] = await Promise.all([supabase.from('brands').select('id'), supabase.from('earbuds').select('id')]);
  const existingIds = (existing || []).map((e) => e.id);
  const results = [];
  const brandIds = new Set();
  for (const raw of rawRows) {
    const { id, name, data, errors, isDuplicate } = validateCsvRow(raw, { brands: brands || [], existingIds });
    if (errors.length > 0) { results.push({ id: id || '?', name, ok: false, error: errors.join(', ') }); continue; }
    if (isDuplicate && !overwrite) { results.push({ id, name, ok: false, error: 'id déjà existant (ignoré — coche "écraser les doublons" pour le mettre à jour)' }); continue; }
    try {
      let error;
      if (isDuplicate) {
        const { data: current } = await supabase.from('earbuds').select('image_url').eq('id', id).single();
        data.image_url = current?.image_url ?? null;
        data.image_count = data.image_url ? 1 : 0;
        Object.assign(data, computeQualityScore(data));
        ({ error } = await supabase.from('earbuds').update(data).eq('id', id));
      } else ({ error } = await supabase.from('earbuds').insert({ id, ...data }));
      if (error) throw error;
      brandIds.add(data.brand_id);
      results.push({ id, name, ok: true, updated: isDuplicate });
    } catch (e) { results.push({ id, name, ok: false, error: e.message }); }
  }
  brandIds.forEach((bId) => revalidateEarbudCaches(bId));
  if (brandIds.size === 0) revalidateEarbudCaches();
  return results;
}

export async function deleteEarbud(id, brandId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds').delete().eq('id', id);
  if (error) redirect(`/admin/earbuds?error=${encodeURIComponent(error.message)}`);
  revalidateEarbudCaches(brandId, id);
  redirect('/admin/earbuds');
}

export async function importBuyLinksCsv(payload) {
  const rawRows = Array.isArray(payload?.rawRows) ? payload.rawRows : [];
  if (rawRows.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const results = [];
  const brandIds = new Set();
  for (const raw of rawRows) {
    const id = raw.id?.toString().trim();
    const buy_url = raw.buy_url?.toString().trim();
    if (!id || !buy_url) { results.push({ id: id || '?', ok: false, error: 'ID ou lien d\'achat manquant' }); continue; }
    try {
      const { data, error } = await supabase.from('earbuds').update({ buy_url }).eq('id', id).select('brand_id, name').single();
      if (error) throw error;
      if (data?.brand_id) brandIds.add(data.brand_id);
      results.push({ id, name: data?.name || id, ok: true, buy_url });
    } catch (e) { results.push({ id, ok: false, error: e.message }); }
  }
  brandIds.forEach((bId) => revalidateEarbudCaches(bId));
  if (brandIds.size === 0) revalidateEarbudCaches();
  return results;
}

export async function updateEarbudBuyUrl(id, buy_url) {
  const supabase = getSupabaseAdmin();
  const cleanUrl = buy_url?.trim() || null;
  const { data, error } = await supabase
    .from('earbuds')
    .update({ buy_url: cleanUrl })
    .eq('id', id)
    .select('id, brand_id, name, buy_url')
    .single();

  if (error) throw new Error(error.message);
  revalidateEarbudCaches(data?.brand_id, id);
  return { ok: true, data };
}

