'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { slugify } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';

function computeReadingMinutes(html) {
  const text = (html || '').replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseJsonField(value, fallback) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value.toString());
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function parseArticleForm(formData) {
  const title = formData.get('title')?.toString().trim() || '';
  const excerpt = formData.get('excerpt')?.toString().trim() || '';
  const content_html = formData.get('content_html')?.toString() || '';
  const status = formData.get('status')?.toString() === 'published' ? 'published' : 'draft';
  const table_of_contents = parseJsonField(formData.get('table_of_contents'), []);
  const submittedWordCount = Number(formData.get('word_count'));
  const word_count = Number.isFinite(submittedWordCount) ? submittedWordCount : 0;
  return { title, excerpt, content_html, status, table_of_contents, word_count };
}

function isValid(data) {
  return Boolean(data.title && data.excerpt);
}

function revalidateArticleCaches(articleId) {
  revalidatePath('/admin');
  revalidatePath('/admin/articles');
  revalidatePath('/');
  revalidatePath('/fr');
  revalidatePath('/en');
  revalidatePath('/fr/blog');
  revalidatePath('/en/blog');
  if (articleId) {
    revalidatePath(`/fr/blog/${articleId}`);
    revalidatePath(`/en/blog/${articleId}`);
  }
}

export async function createArticle(formData) {
  const data = parseArticleForm(formData);
  if (!isValid(data)) redirect('/admin/articles/new?error=missing');
  const idRaw = formData.get('id')?.toString().trim();
  const id = slugify(idRaw || data.title);
  if (!id) redirect('/admin/articles/new?error=missing');

  let cover_image_url = null;
  const file = formData.get('cover_image');
  if (file && file.size > 0) {
    try { cover_image_url = await uploadImage(file, 'articles'); }
    catch (e) { redirect(`/admin/articles/new?error=${encodeURIComponent(e.message)}`); }
  }

  const supabase = getSupabaseAdmin();
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'fr';
  const translation_of = formData.get('translation_of')?.toString().trim() || null;
  const { error } = await supabase.from('articles').insert({
    id,
    locale,
    translation_of,
    ...data,
    cover_image_url,
    reading_minutes: computeReadingMinutes(data.content_html),
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  });
  if (error) redirect(`/admin/articles/new?error=${encodeURIComponent(error.message)}`);
  revalidateArticleCaches(id);
  redirect('/admin/articles');
}

export async function updateArticle(id, formData) {
  const data = parseArticleForm(formData);
  if (!isValid(data)) redirect(`/admin/articles/${id}?error=missing`);
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('articles').select('status, published_at').eq('id', id).single();

  const file = formData.get('cover_image');
  let cover_image_url;
  if (file && file.size > 0) {
    try { cover_image_url = await uploadImage(file, 'articles'); }
    catch (e) { redirect(`/admin/articles/${id}?error=${encodeURIComponent(e.message)}`); }
  }

  const patch = {
    ...data,
    reading_minutes: computeReadingMinutes(data.content_html),
  };
  if (cover_image_url) patch.cover_image_url = cover_image_url;
  if (data.status === 'published' && !existing?.published_at) patch.published_at = new Date().toISOString();
  if (data.status === 'draft') patch.published_at = null;

  const { error } = await supabase.from('articles').update(patch).eq('id', id);
  if (error) redirect(`/admin/articles/${id}?error=${encodeURIComponent(error.message)}`);
  revalidateArticleCaches(id);
  redirect('/admin/articles');
}

export async function deleteArticle(id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) redirect(`/admin/articles?error=${encodeURIComponent(error.message)}`);
  revalidateArticleCaches(id);
  redirect('/admin/articles');
}

export async function uploadEditorImage(formData) {
  const file = formData.get('image');
  if (!file || file.size === 0) return { error: 'Aucun fichier reçu' };
  try { return { url: await uploadImage(file, 'articles-content') }; }
  catch (e) { return { error: e.message }; }
}

export async function toggleArticleStatus(id, currentStatus) {
  const supabase = getSupabaseAdmin();
  const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
  const patch = { status: nextStatus, published_at: nextStatus === 'published' ? new Date().toISOString() : null };
  const { error } = await supabase.from('articles').update(patch).eq('id', id);
  if (error) redirect(`/admin/articles?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/articles');
  revalidatePath('/fr/blog');
  revalidatePath('/en/blog');
  revalidatePath(`/fr/blog/${id}`);
  revalidatePath(`/en/blog/${id}`);
  redirect('/admin/articles');
}
