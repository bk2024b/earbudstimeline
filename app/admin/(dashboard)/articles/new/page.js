import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import ArticleForm from '@/components/admin/ArticleForm';
import { createArticle } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage({ searchParams }) {
  let sourceArticle = null;
  if (searchParams?.translationOf) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('articles')
      .select('id, title, excerpt')
      .eq('id', searchParams.translationOf)
      .single();
    sourceArticle = data || null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">
          {sourceArticle ? 'Traduire un article' : 'Nouvel article'}
        </h1>
        <Link href="/admin/articles" className="text-xs text-dim hover:text-accent">
          ← Retour aux articles
        </Link>
      </div>

      <ArticleForm action={createArticle} sourceArticle={sourceArticle} submitLabel="Créer l'article" />
    </>
  );
}
