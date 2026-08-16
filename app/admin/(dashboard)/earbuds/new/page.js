import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createEarbud } from '../actions';
import EarbudForm from '@/components/admin/EarbudForm';

export const dynamic = 'force-dynamic';

export default async function NewEarbudPage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: brands }, { data: allEarbuds }] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.from('earbuds').select('id, brand_id, gamme'),
  ]);

  let cloneDefaults = {};
  if (searchParams?.cloneFrom) {
    const { data: source } = await supabase
      .from('earbuds')
      .select('*')
      .eq('id', searchParams.cloneFrom)
      .single();
    if (source) {
      cloneDefaults = {
        ...source,
        id: '', // Laisser vide pour forcer la génération d'un nouvel identifiant
        name: `${source.name} (Copie)`,
      };
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin/earbuds" className="text-dim text-xs hover:text-accent mb-1 inline-block">
            ← Écouteurs
          </Link>
          <h1 className="font-display font-bold text-2xl">
            {searchParams?.cloneFrom ? 'Dupliquer un écouteur' : 'Nouvel écouteur'}
          </h1>
        </div>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Champs requis manquants.' : searchParams.error}
        </p>
      )}

      {brands && brands.length === 0 ? (
        <p className="text-dim text-sm">
          Créez d&apos;abord une marque dans{' '}
          <Link href="/admin/brands" className="text-accent">
            /admin/brands
          </Link>
          .
        </p>
      ) : (
        <EarbudForm
          action={createEarbud}
          brands={brands || []}
          existingEarbuds={allEarbuds || []}
          defaults={cloneDefaults}
          submitLabel={searchParams?.cloneFrom ? 'Créer la copie' : 'Créer'}
        />
      )}
    </>
  );
}
