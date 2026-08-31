import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import GuideForm from '@/components/admin/GuideForm';
import { updateGuide } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditGuidePage({ params, searchParams }) {
  const supabase = getSupabaseAdmin();
  const { data: guide } = await supabase.from('guides').select('*').eq('slug', params.slug).maybeSingle();
  if (!guide) notFound();

  const boundAction = updateGuide.bind(null, guide.slug);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Modifier le guide</h1>
        <Link href="/admin/guides" className="text-xs text-dim hover:text-accent">
          ← Retour aux guides
        </Link>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Le titre, la description et l\'intro (EN et FR) sont requis.' : searchParams.error}
        </p>
      )}

      <GuideForm action={boundAction} defaults={guide} lockSlug submitLabel="Enregistrer les modifications" />
    </>
  );
}
