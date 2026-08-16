import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import ArticleForm from '@/components/admin/ArticleForm';
import { updateArticle } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }) {
  const supabase = getSupabaseAdmin();
  const [{ data: article }, models, brands] = await Promise.all([
    supabase.from('articles').select('*').eq('id', params.id).single(),
    getAllEarbuds().catch(() => []),
    getBrands().catch(() => []),
  ]);

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, article.id);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Modifier l&apos;article</h1>
        <Link href="/admin/articles" className="text-xs text-dim hover:text-accent">
          ← Retour aux articles
        </Link>
      </div>

      <ArticleForm
        action={boundUpdate}
        defaults={article}
        models={models}
        brands={brands}
        lockId
        submitLabel="Enregistrer les modifications"
      />
    </>
  );
}
