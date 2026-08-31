import Link from 'next/link';
import GuideForm from '@/components/admin/GuideForm';
import { createGuide } from '../actions';

export const dynamic = 'force-dynamic';

export default function NewGuidePage({ searchParams }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Nouveau guide</h1>
        <Link href="/admin/guides" className="text-xs text-dim hover:text-accent">
          ← Retour aux guides
        </Link>
      </div>

      {searchParams?.error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {searchParams.error === 'missing' ? 'Le titre, la description et l\'intro (EN et FR) sont requis.' : searchParams.error}
        </p>
      )}

      <GuideForm action={createGuide} submitLabel="Créer le guide" />
    </>
  );
}
