import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import BulkImageMatcher from '@/components/admin/BulkImageMatcher';

export const dynamic = 'force-dynamic';

export default async function BulkImagesPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: earbuds }, { data: brands }] = await Promise.all([
    supabase.from('earbuds').select('id, name, brand_id, image_url').order('name'),
    supabase.from('brands').select('id, name').order('name'),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Import multiple de photos</h1>
        <Link href="/admin/earbuds" className="text-xs text-dim hover:text-accent">
          ← Retour aux écouteurs
        </Link>
      </div>

      <BulkImageMatcher earbuds={earbuds || []} brands={brands || []} />
    </>
  );
}
