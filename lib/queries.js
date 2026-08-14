import { getSupabase } from './supabase';

export async function getAllEarbuds() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds')
    .select('*')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBrands() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getBrandById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('brands').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getEarbudsByBrand(brandId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds')
    .select('*')
    .eq('brand_id', brandId)
    .order('release_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEarbudBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('earbuds').select('*').eq('id', slug).single();
  if (error) throw error;
  return data;
}

export async function getGammeModels(brandId, gamme) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds')
    .select('*')
    .eq('brand_id', brandId)
    .eq('gamme', gamme)
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPublishedArticles(locale = 'fr') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('articles')
    .select('id, locale, title, excerpt, cover_image_url, reading_minutes, published_at')
    .eq('status', 'published')
    .eq('locale', locale)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Variante sans filtre de langue, pour le sitemap et llms.txt qui doivent
// référencer les articles des deux langues à la fois.
export async function getAllPublishedArticles() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('articles')
    .select('id, locale, translation_of, title, excerpt, cover_image_url, reading_minutes, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getArticleBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', slug)
    .eq('status', 'published')
    .single();
  if (error) throw error;
  return data;
}

// Retrouve la traduction publiée d'un article (dans l'autre langue), si elle existe.
// - depuis un article FR : cherche l'article EN dont translation_of pointe vers lui
// - depuis un article EN : va chercher directement l'article FR via son translation_of
export async function getArticleTranslation(article) {
  const supabase = getSupabase();

  if (article.locale === 'en') {
    if (!article.translation_of) return null;
    const { data } = await supabase
      .from('articles')
      .select('id, locale, title')
      .eq('id', article.translation_of)
      .eq('status', 'published')
      .maybeSingle();
    return data || null;
  }

  const { data } = await supabase
    .from('articles')
    .select('id, locale, title')
    .eq('translation_of', article.id)
    .eq('status', 'published')
    .maybeSingle();
  return data || null;
}
