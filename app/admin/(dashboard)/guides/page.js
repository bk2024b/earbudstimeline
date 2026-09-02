import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import GuidesManager from '@/components/admin/GuidesManager';

export const dynamic = 'force-dynamic';

export default async function GuidesListPage() {
  const supabase = getSupabaseAdmin();
  const { data: guides } = await supabase
    .from('guides')
    .select('slug, title_en, title_fr, status, priority, render_variant, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Guides</h1>
        <Link href="/admin/guides/new" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity">
          + Nouveau guide
        </Link>
      </div>

      <GuidesManager guides={guides || []} />
    </>
  );
}
