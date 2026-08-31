'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';

function parseJsonField(value, fallback) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value.toString());
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function parseGuideForm(formData) {
  const priorityRaw = Number(formData.get('priority'));
  return {
    priority: Number.isFinite(priorityRaw) ? priorityRaw : 0.75,
    title_en: formData.get('title_en')?.toString().trim() || '',
    description_en: formData.get('description_en')?.toString().trim() || '',
    intro_en: formData.get('intro_en')?.toString().trim() || '',
    sections_en: parseJsonField(formData.get('sections_en'), []),
    faq_en: parseJsonField(formData.get('faq_en'), []).length ? parseJsonField(formData.get('faq_en'), []) : null,
    title_fr: formData.get('title_fr')?.toString().trim() || '',
    description_fr: formData.get('description_fr')?.toString().trim() || '',
    intro_fr: formData.get('intro_fr')?.toString().trim() || '',
    sections_fr: parseJsonField(formData.get('sections_fr'), []),
    faq_fr: parseJsonField(formData.get('faq_fr'), []).length ? parseJsonField(formData.get('faq_fr'), []) : null,
    filter: parseJsonField(formData.get('filter'), null),
    sort: parseJsonField(formData.get('sort'), []),
    status: formData.get('status')?.toString() === 'published' ? 'published' : 'draft',
  };
}

function isValid(data) {
  return Boolean(data.title_en && data.description_en && data.intro_en && data.title_fr && data.description_fr && data.intro_fr);
}

function revalidateGuideCaches(slug) {
  revalidatePath('/admin');
  revalidatePath('/admin/guides');
  revalidatePath('/fr');
  revalidatePath('/en');
  if (slug) {
    revalidatePath(`/fr/guides/${slug}`);
    revalidatePath(`/en/guides/${slug}`);
  }
}

export async function createGuide(formData) {
  const data = parseGuideForm(formData);
  if (!isValid(data)) redirect('/admin/guides/new?error=missing');
  const slugRaw = formData.get('slug')?.toString().trim();
  const slug = slugify(slugRaw || data.title_en);
  if (!slug) redirect('/admin/guides/new?error=missing');

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('guides').insert({ slug, ...data });
  if (error) redirect(`/admin/guides/new?error=${encodeURIComponent(error.message)}`);
  revalidateGuideCaches(slug);
  redirect('/admin/guides');
}

export async function updateGuide(slug, formData) {
  const data = parseGuideForm(formData);
  if (!isValid(data)) redirect(`/admin/guides/${slug}?error=missing`);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('guides').update(data).eq('slug', slug);
  if (error) redirect(`/admin/guides/${slug}?error=${encodeURIComponent(error.message)}`);
  revalidateGuideCaches(slug);
  redirect('/admin/guides');
}

export async function deleteGuide(slug) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('guides').delete().eq('slug', slug);
  if (error) redirect(`/admin/guides?error=${encodeURIComponent(error.message)}`);
  revalidateGuideCaches(slug);
  redirect('/admin/guides');
}

export async function toggleGuideStatus(slug, currentStatus) {
  const supabase = getSupabaseAdmin();
  const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
  const { error } = await supabase.from('guides').update({ status: nextStatus }).eq('slug', slug);
  if (error) redirect(`/admin/guides?error=${encodeURIComponent(error.message)}`);
  revalidateGuideCaches(slug);
  redirect('/admin/guides');
}
