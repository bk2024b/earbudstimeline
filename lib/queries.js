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

export async function getPublishedArticles() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, cover_image_url, reading_minutes, published_at')
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
