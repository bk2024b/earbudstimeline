import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import BuyLinksImportForm from '@/components/admin/BuyLinksImportForm';

export const dynamic = 'force-dynamic';

export default async function ImportBuyLinksPage() {
  const supabase = getSupabaseAdmin();
  const { data: earbuds } = await supabase.from('earbuds').select('id');

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Import des Liens d&apos;Achat (CSV)</h1>
        <Link href="/admin/earbuds" className="text-xs text-dim hover:text-accent">
          ← Retour aux écouteurs
        </Link>
      </div>

      <p className="text-sm text-dim mb-6 max-w-2xl">
        Mettez à jour rapidement les URLs d&apos;achat / affiliation de vos écouteurs en important un simple fichier CSV contenant deux colonnes : <code>id</code> (l&apos;identifiant du modèle, ex: <code>app2c</code>) et <code>buy_url</code> (l&apos;URL Amazon, FNAC, boutique officielle, etc.).
      </p>

      <BuyLinksImportForm existingIds={(earbuds || []).map((e) => e.id)} />
    </>
  );
}
