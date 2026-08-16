import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { updateEarbud } from '../actions';
import EarbudForm from '@/components/admin/EarbudForm';

export const dynamic = 'force-dynamic';

export default async function EditEarbudPage({ params, searchParams }) {
  const supabase = getSupabaseAdmin();
  const [{ data: earbud }, { data: brands }, { data: allEarbuds }] = await Promise.all([
    supabase.from('earbuds').select('*').eq('id', params.id).single(),
    supabase.from('brands').select('*').order('name'),
    supabase.from('earbuds').select('id, brand_id, gamme'),
  ]);
  if (!earbud) notFound();

  const updateWithId = updateEarbud.bind(null, earbud.id);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin/earbuds" className="text-dim text-xs hover:text-accent mb-1 inline-block">
            ← Écouteurs
          </Link>
          <h1 className="font-display font-bold text-2xl">Modifier {earbud.name}</h1>
        </div>
        <a
          href={`/fr/ecouteurs/${earbud.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-dim hover:text-white px-3 py-1.5 rounded-lg bg-panel border border-line flex items-center gap-1.5"
        >
          <span>↗</span> Voir sur le site
        </a>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Champs requis manquants.' : searchParams.error}
        </p>
      )}

      <EarbudForm
        action={updateWithId}
        brands={brands || []}
        existingEarbuds={allEarbuds || []}
        defaults={earbud}
        lockId
        submitLabel="Enregistrer"
      />
    </>
  );
}
