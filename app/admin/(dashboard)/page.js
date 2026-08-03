import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const [{ count: brandsCount }, { count: earbudsCount }] = await Promise.all([
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('earbuds').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <>
      <h1 className="font-display font-bold text-2xl mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
        <div className="bg-panel border border-line rounded-xl p-5">
          <b className="block font-display text-2xl">{brandsCount ?? 0}</b>
          <span className="text-dim text-xs uppercase tracking-wide">Marques</span>
        </div>
        <div className="bg-panel border border-line rounded-xl p-5">
          <b className="block font-display text-2xl">{earbudsCount ?? 0}</b>
          <span className="text-dim text-xs uppercase tracking-wide">Écouteurs</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/admin/brands" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
          Gérer les marques
        </Link>
        <Link href="/admin/earbuds" className="bg-panel2 border border-line rounded-lg px-4 py-2 text-sm">
          Gérer les écouteurs
        </Link>
      </div>
    </>
  );
}
