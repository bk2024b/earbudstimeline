import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteBrand } from './actions';
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton';

export const dynamic = 'force-dynamic';

export default async function BrandsList({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: brands }, { data: earbuds }] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.from('earbuds').select('brand_id'),
  ]);

  const countByBrand = {};
  (earbuds || []).forEach((e) => {
    countByBrand[e.brand_id] = (countByBrand[e.brand_id] || 0) + 1;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Marques</h1>
        <Link href="/admin/brands/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
          + Nouvelle marque
        </Link>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">Erreur : {searchParams.error}</p>
      )}

      <div className="flex flex-col gap-2">
        {(brands || []).map((b) => {
          const count = countByBrand[b.id] || 0;
          return (
            <div
              key={b.id}
              className="flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md flex-none" style={{ background: b.color }} />
                <div>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-xs text-dim">
                    {b.id} · {count} écouteur{count > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/brands/${b.id}`} className="text-xs text-dim hover:text-accent">
                  Modifier
                </Link>
                <form action={deleteBrand.bind(null, b.id)}>
                  <ConfirmSubmitButton
                    className="text-xs text-rose-400 hover:text-rose-300"
                    message={
                      count > 0
                        ? `Supprimer ${b.name} ? Cela supprimera aussi ses ${count} écouteur(s).`
                        : `Supprimer ${b.name} ?`
                    }
                  >
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}
        {(!brands || brands.length === 0) && (
          <p className="text-dim text-sm">Aucune marque pour l&apos;instant.</p>
        )}
      </div>
    </>
  );
}
