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

export async function importBulkArticles({ articles = [], overwrite = false }) {
  if (!Array.isArray(articles) || articles.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const results = [];
  const articleIds = [];

  for (const item of articles) {
    const title = item.title?.toString().trim();
    const id = slugify(item.id || title);
    const excerpt = item.excerpt?.toString().trim() || '';
    const content_html = item.content_html || '';
    const locale = item.locale === 'en' ? 'en' : 'fr';
    const status = item.status === 'published' ? 'published' : 'draft';
    const translation_of = item.translation_of?.toString().trim() || null;
    const cover_image_url = item.cover_image_url?.toString().trim() || null;
    const table_of_contents = Array.isArray(item.table_of_contents) ? item.table_of_contents : [];
    const word_count = Number(item.word_count) || (content_html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length);
    const reading_minutes = Number(item.reading_minutes) || Math.max(1, Math.round(word_count / 200));

    if (!title || !id) {
      results.push({ id: id || '?', title: title || 'Sans titre', ok: false, error: 'Titre ou ID manquant' });
      continue;
    }

    try {
      const { data: existing } = await supabase.from('articles').select('id, published_at').eq('id', id).maybeSingle();
      const isDuplicate = Boolean(existing);

      if (isDuplicate && !overwrite) {
        results.push({ id, title, ok: false, isDuplicate: true, error: 'Un article avec cet ID existe déjà' });
        continue;
      }

      const row = {
        id,
        locale,
        translation_of,
        title,
        excerpt,
        content_html,
        status,
        table_of_contents,
        word_count,
        reading_minutes,
        cover_image_url,
        published_at: status === 'published' ? (existing?.published_at || new Date().toISOString()) : null,
      };

      if (isDuplicate) {
        const { error } = await supabase.from('articles').update(row).eq('id', id);
        if (error) throw error;
        results.push({ id, title, ok: true, updated: true, locale, status });
      } else {
        const { error } = await supabase.from('articles').insert(row);
        if (error) throw error;
        results.push({ id, title, ok: true, updated: false, locale, status });
      }

      articleIds.push(id);
    } catch (e) {
      results.push({ id, title, ok: false, error: e.message });
    }
  }

  // Revalidation globale des caches
  revalidatePath('/admin');
  revalidatePath('/admin/articles');
  revalidatePath('/fr/blog');
  revalidatePath('/en/blog');
  articleIds.forEach((artId) => {
    revalidatePath(`/fr/blog/${artId}`);
    revalidatePath(`/en/blog/${artId}`);
  });

  return results;
}

