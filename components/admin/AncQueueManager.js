'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function AncQueueManager({ queue = [], stats = [] }) {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const summary = useMemo(() => {
    const out = { total: stats.length, scored: 0, complete: 0, partial: 0, noEvidence: 0 };
    stats.forEach((s) => {
      if (s.anc_score !== null) out.scored++;
      if (s.engine_status === 'COMPLETE') out.complete++;
      if (s.engine_status === 'PARTIAL') out.partial++;
      if (s.engine_status === 'NO_EVIDENCE') out.noEvidence++;
    });
    return out;
  }, [stats]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.filter((item) => {
      if (status !== 'all' && item.anc_status !== status) return false;
      if (!q) return true;
      return [item.brand, item.earbud, item.earbud_id].some((v) => v?.toLowerCase().includes(q));
    });
  }, [queue, search, status]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Total', summary.total, 'text-white'],
          ['Avec score', summary.scored, 'text-accent'],
          ['Complete', summary.complete, 'text-emerald-400'],
          ['Partial', summary.partial, 'text-amber'],
          ['Sans preuve', summary.noEvidence, 'text-dim'],
        ].map(([label, value, cls]) => (
          <div key={label} className="bg-panel border border-line rounded-xl p-4">
            <div className="text-[11px] text-dim uppercase tracking-wide">{label}</div>
            <div className={`text-2xl font-semibold mt-1 ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une marque ou un modèle..."
          className="flex-1 bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="PARTIAL">Partial</option>
          <option value="NO_EVIDENCE">Sans preuve</option>
          <option value="COMPLETE">Complete</option>
        </select>
      </div>

      <div className="border border-line rounded-xl overflow-hidden bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1050px]">
            <thead className="bg-panel2 text-dim">
              <tr>
                <th className="text-left px-3 py-3">#</th>
                <th className="text-left px-3 py-3">Écouteur</th>
                <th className="text-left px-3 py-3">Statut</th>
                <th className="text-left px-3 py-3">Couverture</th>
                <th className="text-left px-3 py-3">ANC</th>
                <th className="text-left px-3 py-3">Travel</th>
                <th className="text-left px-3 py-3">Office</th>
                <th className="text-left px-3 py-3">Traffic</th>
                <th className="text-left px-3 py-3">Voices</th>
                <th className="text-left px-3 py-3">Sources</th>
                <th className="text-right px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.earbud_id} className="border-t border-line hover:bg-panel2/50">
                  <td className="px-3 py-3 font-mono text-dim">{item.priority_rank}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-white">{item.earbud}</div>
                    <div className="text-dim mt-0.5">{item.brand} · {item.release_date?.slice(0, 4) || '—'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded border ${item.anc_status === 'COMPLETE' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : item.anc_status === 'PARTIAL' ? 'text-amber border-amber/30 bg-amber/10' : 'text-dim border-line'}`}>
                      {item.anc_status}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono">{Number(item.score_coverage || 0).toFixed(0)}%</td>
                  <td className="px-3 py-3 font-mono font-semibold text-accent">{item.anc_score ?? '—'}</td>
                  <td className="px-3 py-3 font-mono">{item.anc_travel_score ?? '—'}</td>
                  <td className="px-3 py-3 font-mono">{item.anc_office_score ?? '—'}</td>
                  <td className="px-3 py-3 font-mono">{item.anc_traffic_score ?? '—'}</td>
                  <td className="px-3 py-3 font-mono">{item.anc_voices_score ?? '—'}</td>
                  <td className="px-3 py-3">{item.source_count}</td>
                  <td className="px-3 py-3 text-right">
                    <Link href={`/admin/anc/${item.earbud_id}`} className="bg-accent text-ink font-semibold px-3 py-1.5 rounded-lg inline-block">
                      Documenter
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-dim text-sm">Aucun résultat.</div>}
      </div>
    </div>
  );
}
