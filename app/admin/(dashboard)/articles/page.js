import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import ArticlesManager from '@/components/admin/ArticlesManager';

export const dynamic = 'force-dynamic';

export default async function ArticlesListPage() {
  const supabase = getSupabaseAdmin();
  const { data: articles } = await supabase
    .from('articles')
    .select('id, locale, translation_of, title, excerpt, status, reading_minutes, cover_image_url, published_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Articles</h1>
        <Link href="/admin/articles/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
          + Nouvel article
        </Link>
      </div>

      <ArticlesManager articles={articles || []} />
    </>
  );
}
