import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteEarbud } from './actions';
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton';

export const dynamic = 'force-dynamic';

export default async function EarbudsList({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: earbuds }, { data: brands }] = await Promise.all([
    supabase.from('earbuds').select('*').order('release_date', { ascending: false }),
    supabase.from('brands').select('*').order('name'),
  ]);

  const brandName = (id) => brands?.find((b) => b.id === id)?.name || id;
  const activeBrand = searchParams?.brand || 'all';
  const filtered = activeBrand === 'all' ? earbuds : (earbuds || []).filter((e) => e.brand_id === activeBrand);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Écouteurs</h1>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/earbuds/import-csv"
            className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm"
          >
            📄 Import CSV
          </Link>
          <Link
            href="/admin/earbuds/bulk-images"
            className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm"
          >
            📤 Import multiple
          </Link>
          <Link href="/admin/earbuds/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
            + Nouvel écouteur
          </Link>
        </div>
      </div>

      {searchParams?.error && <p className="text-rose-400 text-sm mb-4">Erreur : {searchParams.error}</p>}

      <div className="flex gap-2 flex-wrap mb-6">
        <FilterChip href="/admin/earbuds" active={activeBrand === 'all'}>
          Toutes les marques
        </FilterChip>
        {(brands || []).map((b) => (
          <FilterChip key={b.id} href={`/admin/earbuds?brand=${b.id}`} active={activeBrand === b.id}>
            {b.name}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {(filtered || []).map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3 gap-3 flex-wrap"
          >
            <div>
              <div className="text-sm font-semibold">
                🎧 {e.name} {e.marquant && <span className="text-amber">★</span>}
              </div>
              <div className="text-xs text-dim">
                {brandName(e.brand_id)} · {e.gamme} · {e.release_date?.slice(0, 4)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/admin/earbuds/${e.id}`} className="text-xs text-dim hover:text-accent">
                Modifier
              </Link>
              <form action={deleteEarbud.bind(null, e.id, e.brand_id)}>
                <ConfirmSubmitButton
                  className="text-xs text-rose-400 hover:text-rose-300"
                  message={`Supprimer ${e.name} ?`}
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-dim text-sm">Aucun écouteur pour l&apos;instant.</p>
        )}
      </div>
    </>
  );
}

function FilterChip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
        active ? 'bg-accent/15 border-accent text-accent' : 'border-line text-dim hover:border-accent'
      }`}
    >
      {children}
    </Link>
  );
}
