import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import AncQueueManager from '@/components/admin/AncQueueManager';

export const dynamic = 'force-dynamic';

export default async function AncAdminPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: queue, error }, { data: stats, error: statsError }] = await Promise.all([
    supabase
      .from('earbuds_anc_evidence_queue')
      .select('*')
      .order('priority_rank', { ascending: true }),
    supabase
      .from('earbuds_anc_engine_test')
      .select('engine_status,anc_score,score_coverage'),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">ANC Intelligence</h1>
          <p className="text-sm text-dim mt-1">
            File de priorité pour documenter les performances ANC sans inventer de scores.
          </p>
        </div>
        <Link
          href="/admin/anc/import"
          className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm"
        >
          📥 Importer les preuves CSV
        </Link>
      </div>

      {error || statsError ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-300 mb-5">
          Impossible de charger les données ANC : {(error || statsError).message}
          <p className="text-xs text-dim mt-2">
            Vérifie que les vues earbuds_anc_evidence_queue et earbuds_anc_engine_test existent dans Supabase.
          </p>
        </div>
      ) : (
        <AncQueueManager queue={queue || []} stats={stats || []} />
      )}
    </>
  );
}
