import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { updateEarbud } from '../actions';
import EarbudForm from '@/components/admin/EarbudForm';

export const dynamic = 'force-dynamic';

export default async function EditEarbudPage({ params, searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: earbud }, { data: brands }] = await Promise.all([
    supabase.from('earbuds').select('*').eq('id', params.id).single(),
    supabase.from('brands').select('*').order('name'),
  ]);
  if (!earbud) notFound();

  const updateWithId = updateEarbud.bind(null, earbud.id);

  return (
    <>
      <Link href="/admin/earbuds" className="text-dim text-xs hover:text-accent mb-4 inline-block">
        ← Écouteurs
      </Link>
      <h1 className="font-display font-bold text-2xl mb-6">Modifier {earbud.name}</h1>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Champs requis manquants.' : searchParams.error}
        </p>
      )}

      <EarbudForm action={updateWithId} brands={brands || []} defaults={earbud} lockId submitLabel="Enregistrer" />
    </>
  );
}
