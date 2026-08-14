import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import CsvImportForm from '@/components/admin/CsvImportForm';

export const dynamic = 'force-dynamic';

export default async function ImportCsvPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: brands }, { data: earbuds }] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('earbuds').select('id'),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Import CSV</h1>
        <Link href="/admin/earbuds" className="text-xs text-dim hover:text-accent">
          ← Retour aux écouteurs
        </Link>
      </div>

      <p className="text-sm text-dim mb-6 max-w-2xl">
        Colonnes attendues : <code>id</code> (optionnel), <code>brand_id</code>, <code>gamme</code>, <code>name</code>,{' '}
        <code>tagline</code>, <code>tagline_en</code> (optionnel), <code>release_date</code> (AAAA-MM-JJ), <code>price</code>, <code>marquant</code>,{' '}
        <code>anc</code>, <code>battery_bud_h</code>, <code>battery_case_h</code>, <code>weight_g</code>,{' '}
        <code>water_rating</code>, <code>chip</code>, <code>bluetooth</code>, <code>usb_c</code>,{' '}
        <code>multipoint</code>, <code>codec</code> (ces 3 derniers optionnels). Marques disponibles :{' '}
        {(brands || []).map((b) => b.id).join(', ')}.
      </p>

      <CsvImportForm brands={brands || []} existingIds={(earbuds || []).map((e) => e.id)} />
    </>
  );
}
