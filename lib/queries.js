import { unstable_cache } from 'next/cache';
import { getSupabase } from './supabase';

const CATALOG_REVALIDATE = 3600;
const ARTICLE_REVALIDATE = 600;

export const getAllEarbuds = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('earbuds').select('*').order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['earbuds-all'], { revalidate: CATALOG_REVALIDATE });

export const getAncScores = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds_anc_scores')
    .select('*');
  if (error) throw error;
  return data || [];
}, ['earbuds-anc-scores'], { revalidate: CATALOG_REVALIDATE });

export const getSearchCatalog = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds')
    .select('id, name, brand_id, gamme, release_date, price, anc')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['earbuds-search-catalog'], { revalidate: CATALOG_REVALIDATE });

export const getBrands = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data;
}, ['brands-all'], { revalidate: CATALOG_REVALIDATE });

export const getAncIntelligence = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('earbuds_anc_scores')
    .select('earbud_id, anc_score, anc_travel_score, anc_office_score, anc_traffic_score, anc_voices_score, environment_count, evidence_count, source_count');
  if (error) throw error;
  return data || [];
}, ['earbuds-anc-intelligence'], { revalidate: CATALOG_REVALIDATE });

export async function getBrandById(id) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('brands').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }, ['brand', id], { revalidate: CATALOG_REVALIDATE })();
}

export async function getEarbudsByBrand(brandId) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('earbuds').select('*').eq('brand_id', brandId).order('release_date', { ascending: false });
    if (error) throw error;
    return data;
  }, ['earbuds-brand', brandId], { revalidate: CATALOG_REVALIDATE })();
}

export async function getEarbudBySlug(slug) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('earbuds').select('*').eq('id', slug).single();
    if (error) throw error;
    return data;
  }, ['earbud', slug], { revalidate: CATALOG_REVALIDATE })();
}

export async function getGammeModels(brandId, gamme) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('earbuds').select('*').eq('brand_id', brandId).eq('gamme', gamme).order('release_date', { ascending: true });
    if (error) throw error;
    return data;
  }, ['earbuds-gamme', brandId, gamme], { revalidate: CATALOG_REVALIDATE });
}

export async function getPublishedArticles(locale = 'fr') {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('articles')
      .select('id, locale, title, excerpt, cover_image_url, reading_minutes, published_at')
      .eq('status', 'published').eq('locale', locale).order('published_at', { ascending: false });
    if (error) throw error;
    return data;
  }, ['articles-published', locale], { revalidate: ARTICLE_REVALIDATE })();
}

export const getAllPublishedArticles = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('articles')
    .select('id, locale, translation_of, title, excerpt, cover_image_url, reading_minutes, published_at')
    .eq('status', 'published').order('published_at', { ascending: false });
  if (error) throw error;
  return data;
}, ['articles-published-all'], { revalidate: ARTICLE_REVALIDATE });

export async function getArticleBySlug(slug) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('articles').select('*').eq('id', slug).eq('status', 'published').single();
    if (error) throw error;
    return data;
  }, ['article', slug], { revalidate: ARTICLE_REVALIDATE })();
}

export async function getArticleTranslation(article) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    if (article.locale === 'en') {
      if (!article.translation_of) return null;
      const { data } = await supabase.from('articles').select('id, locale, title').eq('id', article.translation_of).eq('status', 'published').maybeSingle();
      return data || null;
    }
    const { data } = await supabase.from('articles').select('id, locale, title').eq('translation_of', article.id).eq('status', 'published').maybeSingle();
    return data || null;
  }, ['article-translation', article.id, article.locale], { revalidate: ARTICLE_REVALIDATE })();
}
