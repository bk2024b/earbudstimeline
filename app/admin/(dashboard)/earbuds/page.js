import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import EarbudsManagerNoImages from '@/components/admin/EarbudsManagerNoImages';

export const dynamic = 'force-dynamic';

export default async function EarbudsList({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: earbuds }, { data: brands }] = await Promise.all([
    supabase.from('earbuds').select('*').order('release_date', { ascending: false }),
    supabase.from('brands').select('*').order('name'),
  ]);

  const activeBrand = searchParams?.brand || 'all';

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Écouteurs</h1>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/earbuds/import-csv" className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm flex items-center gap-1.5">
            <span>📄</span> Import CSV
          </Link>
          <Link href="/admin/earbuds/import-links" className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm flex items-center gap-1.5">
            <span>🔗</span> Liens d&apos;achat
          </Link>
          <Link href="/admin/earbuds/bulk-images" className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm flex items-center gap-1.5">
            <span>📤</span> Import photos
          </Link>
          <Link href="/admin/earbuds/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
            + Nouvel écouteur
          </Link>
        </div>
      </div>

      {searchParams?.error && <p className="text-rose-400 text-sm mb-4">Erreur : {searchParams.error}</p>}

      <EarbudsManagerNoImages earbuds={earbuds || []} brands={brands || []} initialBrand={activeBrand} />
    </>
  );
}
