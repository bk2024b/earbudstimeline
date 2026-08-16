import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import BrandBatchImportForm from '@/components/admin/BrandBatchImportForm';

export const dynamic = 'force-dynamic';

export default async function ImportBrandsPage() {
  const supabase = getSupabaseAdmin();
  const { data: brands } = await supabase.from('brands').select('id, name, color').order('name');

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin/brands" className="text-dim text-xs hover:text-accent mb-1 inline-block">
            ← Marques
          </Link>
          <h1 className="font-display font-bold text-2xl">Importer des marques en masse</h1>
        </div>
      </div>

      <BrandBatchImportForm existingBrands={brands || []} />
    </>
  );
}
