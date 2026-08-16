'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { validateBuyLinkRow } from '@/lib/earbudsCsv';
import { importBuyLinksCsv } from '@/app/admin/(dashboard)/earbuds/actions';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function BuyLinksImportForm({ existingIds = [] }) {
  const [rawRows, setRawRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [fileName, setFileName] = useState('');

  const validated = useMemo(
    () => rawRows.map((raw) => validateBuyLinkRow(raw, { existingIds })),
    [rawRows, existingIds]
  );

  const validCount = validated.filter((r) => r.isValid).length;
  const errorCount = validated.filter((r) => !r.isValid).length;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    setResults(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors?.length) {
          setParseError(res.errors[0].message);
        }
        setRawRows(res.data);
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function handleImport() {
    const validRows = rawRows.filter((_, i) => validated[i]?.isValid);
    if (validRows.length === 0) return;
    setSubmitting(true);
    try {
      const res = await importBuyLinksCsv({ rawRows: validRows });
      setResults(Array.isArray(res) ? res : []);
    } catch (e) {
      setResults([{ id: '?', ok: false, error: e.message }]);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Zone de sélection de fichier */}
      <div className="bg-panel border border-line rounded-xl p-6">
        <label className="block text-sm font-semibold mb-2">Fichier CSV des liens d&apos;achat</label>
        <p className="text-xs text-dim mb-4">
          Format attendu : colonnes <code>id</code> et <code>buy_url</code> (ex: <code>app2c, https://amzn.to/...</code>).
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-sm text-dim file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
        />

        {fileName && <p className="text-xs text-accent mt-2 font-mono">Fichier chargé : {fileName}</p>}
        {parseError && <p className="text-xs text-rose-400 mt-2">Erreur CSV : {parseError}</p>}
      </div>

      {/* Résumé de validation avant import */}
      {rawRows.length > 0 && !results && (
        <div className="bg-panel border border-line rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-display font-semibold text-base">Aperçu de validation ({rawRows.length} lignes)</h3>

          <div className="flex gap-4 text-xs font-mono">
            <span className="text-emerald-400">✓ {validCount} valides</span>
            {errorCount > 0 && <span className="text-rose-400">✗ {errorCount} erreurs</span>}
          </div>

          <div className="max-h-60 overflow-y-auto border border-line rounded-lg divide-y divide-line text-xs font-mono">
            {validated.map((r, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between gap-4 bg-panel2/50">
                <span className="text-white font-bold shrink-0">{r.id || '(vide)'}</span>
                <span className="text-dim truncate text-[11px] flex-1">{r.buy_url || '—'}</span>
                {r.isValid ? (
                  <span className="text-emerald-400 shrink-0">Valide</span>
                ) : (
                  <span className="text-rose-400 shrink-0 text-[11px]">{r.errors.join(', ')}</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={validCount === 0 || submitting}
            onClick={handleImport}
            className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm self-start hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? 'Mise à jour en cours...' : `Mettre à jour ${validCount} liens`}
          </button>
        </div>
      )}

      {/* Résultats après import */}
      {results && (
        <div className="bg-panel border border-line rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-display font-semibold text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Mise à jour terminée ({results.filter((r) => r.ok).length}/{results.length} réussis)
          </h3>

          <div className="max-h-60 overflow-y-auto border border-line rounded-lg divide-y divide-line text-xs font-mono">
            {results.map((res, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                <span className="text-white">{res.id} ({res.name})</span>
                {res.ok ? (
                  <span className="text-emerald-400">Mis à jour</span>
                ) : (
                  <span className="text-rose-400">{res.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
