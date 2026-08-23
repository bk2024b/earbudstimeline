import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import BulkArticlesImportForm from '@/components/admin/BulkArticlesImportForm';

export const dynamic = 'force-dynamic';

export default async function ImportArticlesPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: brands }, { data: models }, { data: articles }] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('earbuds').select('id, name, brand_id, gamme'),
    supabase.from('articles').select('id, title, locale'),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Import d'articles en masse</h1>
          <p className="text-xs text-dim mt-1">
            Importez des dizaines d'articles d'un coup depuis vos fichiers Markdown (<code>.md</code>), ou exports <code>.csv</code> / <code>.json</code>.
          </p>
        </div>
        <Link href="/admin/articles" className="text-xs text-dim hover:text-accent font-medium">
          ← Retour aux articles
        </Link>
      </div>

      <BulkArticlesImportForm
        models={models || []}
        brands={brands || []}
        existingArticles={articles || []}
      />
    </>
  );
}
