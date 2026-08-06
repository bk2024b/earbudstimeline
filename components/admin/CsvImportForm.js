'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { validateCsvRow } from '@/lib/earbudsCsv';
import { importEarbudsCsv } from '@/app/admin/(dashboard)/earbuds/actions';

export default function CsvImportForm({ brands, existingIds }) {
  const [rawRows, setRawRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [fileName, setFileName] = useState('');

  const validated = useMemo(
    () => rawRows.map((raw) => validateCsvRow(raw, { brands, existingIds })),
    [rawRows, brands, existingIds]
  );

  const validCount = validated.filter((r) => r.errors.length === 0 && !r.isDuplicate).length;
  const duplicateCount = validated.filter((r) => r.errors.length === 0 && r.isDuplicate).length;
  const errorCount = validated.filter((r) => r.errors.length > 0).length;
  const importableCount = validCount + (overwrite ? duplicateCount : 0);

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
    const toImport = validated.filter((r) => r.errors.length === 0 && (overwrite || !r.isDuplicate));
    if (toImport.length === 0) return;
    setSubmitting(true);
    try {
      const res = await importEarbudsCsv({
        rawRows: rawRows.filter((_, i) => validated[i].errors.length === 0 && (overwrite || !validated[i].isDuplicate)),
        overwrite,
      });
      setResults(Array.isArray(res) ? res : []);
    } catch (e) {
      setResults([{ id: '?', name: '', ok: false, error: e.message }]);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/templates/ecouteurs-modele.csv"
          download
          className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-sm"
        >
          ⬇ Télécharger le modèle CSV
        </a>
        <label className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm cursor-pointer">
          Choisir un fichier CSV
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </label>
        {fileName && <span className="text-xs text-dim">{fileName}</span>}
      </div>

      {parseError && <p className="text-rose-400 text-sm">Erreur de lecture du CSV : {parseError}</p>}

      {rawRows.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-emerald-400">{validCount} prêt(s) à importer</span>
            <span className="text-amber">{duplicateCount} doublon(s) (id déjà existant)</span>
            <span className="text-rose-400">{errorCount} en erreur</span>
          </div>

          {duplicateCount > 0 && (
            <label className="flex items-center gap-2 text-sm text-dim w-fit">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="accent-accent"
              />
              Écraser les doublons (met à jour les écouteurs existants au lieu de les ignorer)
            </label>
          )}

          <div className="border border-line rounded-xl overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-panel2 text-dim sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">id</th>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-left px-3 py-2">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {validated.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2">
                        {r.errors.length > 0 ? (
                          <span className="text-rose-400">✗ Erreur</span>
                        ) : r.isDuplicate ? (
                          <span className="text-amber">{overwrite ? '↻ Mise à jour' : '⏭ Ignoré'}</span>
                        ) : (
                          <span className="text-emerald-400">✓ Prêt</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-dim">{r.id || '—'}</td>
                      <td className="px-3 py-2">{r.name || '—'}</td>
                      <td className="px-3 py-2 text-dim">{r.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={submitting || importableCount === 0}
            className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 w-fit"
          >
            {submitting ? 'Import en cours…' : `Importer ${importableCount} écouteur${importableCount > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {results && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          {results.map((r, i) => (
            <p key={i} className={`text-xs ${r.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
              {r.ok ? '✓' : '✗'} {r.name || r.id} {r.ok && r.updated ? '(mis à jour)' : ''}
              {r.error ? ` — ${r.error}` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
