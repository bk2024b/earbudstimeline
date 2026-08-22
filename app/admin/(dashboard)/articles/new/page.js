import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import ArticleForm from '@/components/admin/ArticleForm';
import { createArticle } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  let sourceArticle = null;

  const [models, brands] = await Promise.all([
    getAllEarbuds().catch(() => []),
    getBrands().catch(() => []),
  ]);

  if (searchParams?.translationOf) {
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

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Titre et extrait sont requis.' : searchParams.error}
        </p>
      )}

      <ArticleForm
        action={createArticle}
        sourceArticle={sourceArticle}
        models={models}
        brands={brands}
        submitLabel="Créer l'article"
      />
    </>
  );
}
