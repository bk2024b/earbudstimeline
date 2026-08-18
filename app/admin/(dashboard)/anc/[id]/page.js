import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import AncEvidenceForm from '@/components/admin/AncEvidenceForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AncEvidencePage({ params, searchParams }) {
  const { id } = params;
  const supabase = getSupabaseAdmin();

  const [{ data: earbud }, { data: evidence }, { data: score }] = await Promise.all([
    supabase.from('earbuds').select('id,name,brand_id,release_date,anc').eq('id', id).single(),
    supabase.from('earbuds_evidence').select('*').eq('earbud_id', id).eq('metric', 'anc').order('id'),
    supabase.from('earbuds_anc_scores').select('*').eq('earbud_id', id).maybeSingle(),
  ]);

  if (!earbud) return <div className="text-rose-400">Écouteur introuvable.</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/anc" className="text-xs text-dim hover:text-white">← Queue ANC</Link>
          <h1 className="font-display font-bold text-2xl mt-2">{earbud.name}</h1>
          <p className="text-sm text-dim mt-1">Documentation des preuves ANC · {earbud.id}</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-dim uppercase">ANC Score</div>
          <div className="text-3xl font-semibold text-accent">{score?.anc_score ?? '—'}</div>
        </div>
      </div>

      {searchParams?.error && <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">Erreur : {searchParams.error}</div>}
      {searchParams?.saved && <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">Preuve enregistrée. Les scores calculés sont actualisés par les vues Supabase.</div>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['ANC', score?.anc_score],
          ['Travel', score?.anc_travel_score],
          ['Office', score?.anc_office_score],
          ['Traffic', score?.anc_traffic_score],
          ['Voices', score?.anc_voices_score],
        ].map(([label, value]) => (
          <div key={label} className="bg-panel border border-line rounded-xl p-4">
            <div className="text-[11px] text-dim">{label}</div>
            <div className="font-mono text-xl mt-1 text-white">{value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-xl p-5">
        <h2 className="font-semibold text-white mb-1">Ajouter une preuve ANC</h2>
        <p className="text-xs text-dim mb-4">Les champs obligatoires sont conçus pour éviter les preuves impossibles à rattacher ou à vérifier.</p>
        <AncEvidenceForm earbudId={id} />
      </div>

      <div className="bg-panel border border-line rounded-xl overflow-hidden">
        <div className="p-5 border-b border-line">
          <h2 className="font-semibold text-white">Preuves existantes ({evidence?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1000px]">
            <thead className="bg-panel2 text-dim">
              <tr>
                <th className="text-left px-3 py-3">ID</th>
                <th className="text-left px-3 py-3">Environnement</th>
                <th className="text-left px-3 py-3">Valeur</th>
                <th className="text-left px-3 py-3">Mesure</th>
                <th className="text-left px-3 py-3">Source</th>
                <th className="text-left px-3 py-3">Confiance</th>
                <th className="text-left px-3 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(evidence || []).map((row) => (
                <tr key={row.id} className="border-t border-line align-top">
                  <td className="px-3 py-3 font-mono text-dim">{row.id}</td>
                  <td className="px-3 py-3"><div className="font-semibold">{row.noise_category}</div><div className="text-dim">{row.measurement_context || '—'}</div></td>
                  <td className="px-3 py-3 font-mono">{row.value}</td>
                  <td className="px-3 py-3">{row.measurement_type || '—'}</td>
                  <td className="px-3 py-3"><div>{row.source_name || '—'}</div><a href={row.source_url} target="_blank" rel="noreferrer" className="text-accent break-all">source ↗</a></td>
                  <td className="px-3 py-3">{row.confidence || '—'}</td>
                  <td className="px-3 py-3 max-w-[300px] text-dim">{row.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
