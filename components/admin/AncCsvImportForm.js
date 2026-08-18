'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { importAncEvidenceCsv } from '@/app/admin/(dashboard)/anc/actions';

const required = ['earbud_id', 'value', 'source_url', 'noise_category'];

export default function AncCsvImportForm() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  const validation = useMemo(() => rows.map((r) => {
    const missing = required.filter((k) => !r[k]?.toString().trim());
    return { row: r, missing };
  }), [rows]);

  const valid = validation.filter((r) => r.missing.length === 0);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setResults(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors?.length) setError(res.errors[0].message);
        setRows(res.data || []);
      },
      error: (err) => setError(err.message),
    });
  }

  async function handleImport() {
    if (!valid.length) return;
    setBusy(true);
    try {
      setResults(await importAncEvidenceCsv({ rows: valid.map((v) => v.row) }));
    } catch (e) {
      setResults([{ ok: false, earbud_id: '?', error: e.message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-panel border border-line rounded-xl p-5">
        <h2 className="font-semibold text-white">Format CSV</h2>
        <p className="text-xs text-dim mt-2">Une ligne = une preuve ANC. Pour mettre à jour une preuve existante, renseigne son <code>evidence_id</code>.</p>
        <pre className="mt-3 bg-panel2 border border-line rounded-lg p-3 overflow-x-auto text-[11px] text-dim">{`evidence_id,earbud_id,metric,value,measurement_type,measurement_context,noise_category,source_url,source_name,source_type,confidence,notes\n,technics-eah-az100,anc,exceptional,qualitative_environment,airplane cabin,airplane,https://…,RTINGS,laboratory,high,Notes`}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm cursor-pointer">
          Choisir un CSV
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </label>
        <a
          href="data:text/csv;charset=utf-8,evidence_id%2Cearbud_id%2Cmetric%2Cvalue%2Cmeasurement_type%2Cmeasurement_context%2Cnoise_category%2Csource_url%2Csource_name%2Csource_type%2Cconfidence%2Cnotes%0A%2Ctechnics-eah-az100%2Canc%2Cexceptional%2Cqualitative_environment%2Cairplane%20cabin%2Cairplane%2Chttps%3A%2F%2Fexample.com%2CRTINGS%2Claboratory%2Chigh%2C"
          download="anc-evidence-template.csv"
          className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm"
        >
          ⬇ Modèle CSV
        </a>
      </div>

      {error && <div className="text-sm text-rose-400">Erreur CSV : {error}</div>}

      {rows.length > 0 && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-white">{rows.length} ligne(s)</span>
            <span className="text-emerald-400">{valid.length} valide(s)</span>
            <span className="text-rose-400">{rows.length - valid.length} invalide(s)</span>
          </div>

          <div className="border border-line rounded-xl overflow-hidden bg-panel">
            <div className="max-h-[460px] overflow-auto">
              <table className="w-full text-xs min-w-[800px]">
                <thead className="bg-panel2 text-dim sticky top-0">
                  <tr><th className="text-left px-3 py-2">Ligne</th><th className="text-left px-3 py-2">Écouteur</th><th className="text-left px-3 py-2">Valeur</th><th className="text-left px-3 py-2">Environnement</th><th className="text-left px-3 py-2">Source</th><th className="text-left px-3 py-2">Validation</th></tr>
                </thead>
                <tbody>
                  {validation.map((v, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2">{i + 2}</td>
                      <td className="px-3 py-2">{v.row.earbud_id || '—'}</td>
                      <td className="px-3 py-2">{v.row.value || '—'}</td>
                      <td className="px-3 py-2">{v.row.noise_category || '—'}</td>
                      <td className="px-3 py-2">{v.row.source_name || v.row.source_url || '—'}</td>
                      <td className="px-3 py-2">{v.missing.length ? <span className="text-rose-400">Manquant : {v.missing.join(', ')}</span> : <span className="text-emerald-400">✓</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button type="button" onClick={handleImport} disabled={busy || !valid.length} className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm w-fit disabled:opacity-50">
            {busy ? 'Import en cours…' : `Importer ${valid.length} preuve${valid.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {results && <div className="border-t border-line pt-4 flex flex-col gap-1">{results.map((r, i) => <div key={i} className={`text-xs ${r.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{r.ok ? '✓' : '✗'} {r.earbud_id}{r.error ? ` — ${r.error}` : ''}</div>)}</div>}
    </div>
  );
}
