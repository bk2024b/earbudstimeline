import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createEarbud } from '../actions';
import EarbudForm from '@/components/admin/EarbudForm';

export const dynamic = 'force-dynamic';

export default async function NewEarbudPage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const { data: brands } = await supabase.from('brands').select('*').order('name');

  return (
    <>
      <Link href="/admin/earbuds" className="text-dim text-xs hover:text-accent mb-4 inline-block">
        ← Écouteurs
      </Link>
      <h1 className="font-display font-bold text-2xl mb-6">Nouvel écouteur</h1>

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
        <EarbudForm action={createEarbud} brands={brands || []} submitLabel="Créer" />
      )}
    </>
  );
}
