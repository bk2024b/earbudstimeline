import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteArticle } from './actions';
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton';

export const dynamic = 'force-dynamic';

export default async function ArticlesListPage() {
  const supabase = getSupabaseAdmin();
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, status, reading_minutes, published_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Articles</h1>
        <Link href="/admin/articles/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
          + Nouvel article
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(articles || []).map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 bg-panel border border-line rounded-xl px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{a.title}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    a.status === 'published' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-amber/15 text-amber'
                  }`}
                >
                  {a.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="text-xs text-dim mt-0.5">
                {a.reading_minutes} min de lecture · {a.id}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/articles/${a.id}`} className="text-xs text-dim hover:text-accent px-2 py-1">
                Modifier
              </Link>
              <form action={deleteArticle.bind(null, a.id)}>
                <ConfirmSubmitButton
                  message={`Supprimer l'article "${a.title}" ?`}
                  className="text-xs text-dim hover:text-rose-400 px-2 py-1"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {(!articles || articles.length === 0) && <p className="text-dim text-sm">Aucun article pour l&apos;instant.</p>}
      </div>
    </>
  );
}
