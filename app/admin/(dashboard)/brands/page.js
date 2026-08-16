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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">
          Marques <span className="text-dim text-sm font-normal">({brands?.length || 0})</span>
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/brands/import"
            className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <span>📄</span> Import en masse
          </Link>
          <Link href="/admin/brands/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm">
            + Nouvelle marque
          </Link>
        </div>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">Erreur : {searchParams.error}</p>
      )}

      <div className="flex flex-col gap-2.5">
        {(brands || []).map((b) => {
          const count = countByBrand[b.id] || 0;
          return (
            <div
              key={b.id}
              className="flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3 hover:border-line/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex-none border border-line/60 shadow-sm"
                  style={{ background: b.color }}
                />
                <div>
                  <div className="text-sm font-semibold text-white">{b.name}</div>
                  <div className="text-xs text-dim">
                    <code className="font-mono text-[11px] text-accent/80">{b.id}</code> · {count} écouteur{count > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/fr/marques/${b.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Voir la page marque publique"
                  className="text-xs text-dim hover:text-white px-2 py-1 rounded bg-panel2 border border-line/60 flex items-center gap-1"
                >
                  <span>↗</span>
                  <span className="hidden sm:inline">Voir</span>
                </a>
                <Link
                  href={`/admin/brands/${b.id}`}
                  className="text-xs text-ink bg-accent font-semibold px-3 py-1 rounded hover:opacity-90"
                >
                  Modifier
                </Link>
                <form action={deleteBrand.bind(null, b.id)}>
                  <ConfirmSubmitButton
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
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
