'use client';

import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { slugify } from '@/lib/slug';
import { importBrandsBatch } from '@/app/admin/(dashboard)/brands/actions';

const DEFAULT_PALETTE = [
  '#6C8CFF', '#34D399', '#FB7185', '#FACC15', '#A78BFA',
  '#F43F5E', '#38BDF8', '#4ADE80', '#FB923C', '#E879F9',
  '#94A3B8', '#F59E0B', '#2DD4BF', '#818CF8', '#EC4899',
];

export default function BrandBatchImportForm({ existingBrands = [] }) {
  const [tab, setTab] = useState('text'); // 'text' | 'csv'
  const [rawText, setRawText] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const existingIds = useMemo(
    () => new Set(existingBrands.map((b) => b.id.toLowerCase())),
    [existingBrands]
  );

  // Parser le texte brut ligne par ligne
  const parsedFromText = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      // Formats possibles : "Nom", "Nom, #Couleur", "Nom, #Couleur, slug", "Nom; #Couleur"
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      const name = parts[0] || '';
      let color = parts[1] || '';
      const customId = parts[2] || '';

      // Si couleur invalide ou absente, attribuer une couleur de la palette
      if (!color || !color.startsWith('#')) {
        color = DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
      }

      const id = slugify(customId || name);
      const isDuplicate = existingIds.has(id);
      const errors = [];
      if (!name) errors.push('Nom manquant');
      if (!id) errors.push('Identifiant invalide');

      return {
        id,
        name,
        color,
        isDuplicate,
        errors,
      };
    });
  }, [rawText, existingIds]);

  // Parser les données issues du CSV
  const parsedFromCsv = useMemo(() => {
    return csvRows.map((row, idx) => {
      const name = (row.name || row.nom || Object.values(row)[0] || '').toString().trim();
      let color = (row.color || row.couleur || '').toString().trim();
      const customId = (row.id || '').toString().trim();

      if (!color || !color.startsWith('#')) {
        color = DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
      }

      const id = slugify(customId || name);
      const isDuplicate = existingIds.has(id);
      const errors = [];
      if (!name) errors.push('Nom manquant');
      if (!id) errors.push('Identifiant invalide');

      return {
        id,
        name,
        color,
        isDuplicate,
        errors,
      };
    });
  }, [csvRows, existingIds]);

  const activeRows = tab === 'text' ? parsedFromText : parsedFromCsv;

  const validCount = activeRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length;
  const duplicateCount = activeRows.filter((r) => r.errors.length === 0 && r.isDuplicate).length;
  const errorCount = activeRows.filter((r) => r.errors.length > 0).length;
  const importableCount = validCount + (overwrite ? duplicateCount : 0);

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setCsvRows(res.data || []);
      },
    });
  }

  async function handleImport() {
    const toImport = activeRows.filter((r) => r.errors.length === 0 && (overwrite || !r.isDuplicate));
    if (toImport.length === 0) return;

    setSubmitting(true);
    try {
      const res = await importBrandsBatch({
        rawRows: toImport,
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
      {/* Onglets de méthode d'import */}
      <div className="flex gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => { setTab('text'); setResults(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'text'
              ? 'bg-accent text-ink'
              : 'bg-panel2 text-dim hover:text-white border border-line'
          }`}
        >
          ✏️ Saisie rapide (texte multiligne)
        </button>
        <button
          type="button"
          onClick={() => { setTab('csv'); setResults(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'csv'
              ? 'bg-accent text-ink'
              : 'bg-panel2 text-dim hover:text-white border border-line'
          }`}
        >
          📄 Fichier CSV
        </button>
      </div>

      {tab === 'text' ? (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-dim">
            Collez votre liste de marques (1 par ligne). Exemples :
            <code className="block bg-panel p-2 rounded mt-1 font-mono text-[11px] text-accent">
              Bose<br />
              Sennheiser, #003366<br />
              JBL, #FF6600, jbl<br />
              Beats, #E01F3D<br />
              Soundcore
            </code>
          </label>
          <textarea
            rows={6}
            placeholder="Entrez une marque par ligne..."
            value={rawText}
            onChange={(e) => { setRawText(e.target.value); setResults(null); }}
            className="w-full bg-panel2 border border-line rounded-lg p-3 text-sm text-white font-mono outline-none focus:border-accent resize-y"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/templates/marques-modele.csv"
              download
              className="border border-line text-dim hover:text-accent rounded-lg px-4 py-2 text-xs"
            >
              ⬇ Télécharger le modèle CSV
            </a>
            <label className="bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-xs cursor-pointer hover:opacity-90">
              Choisir un fichier CSV
              <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="hidden" />
            </label>
            {fileName && <span className="text-xs text-dim">{fileName}</span>}
          </div>
        </div>
      )}

      {/* Prévisualisation et validation */}
      {activeRows.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 text-xs font-medium pt-2">
            <span className="text-emerald-400">✓ {validCount} prête(s)</span>
            <span className="text-amber">⚠ {duplicateCount} déjà existante(s)</span>
            {errorCount > 0 && <span className="text-rose-400">✗ {errorCount} en erreur</span>}
          </div>

          {duplicateCount > 0 && (
            <label className="flex items-center gap-2 text-xs text-dim cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="accent-accent cursor-pointer"
              />
              Écraser / mettre à jour les marques déjà existantes
            </label>
          )}

          <div className="border border-line rounded-xl overflow-hidden bg-panel">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-panel2 text-dim sticky top-0 border-b border-line">
                  <tr>
                    <th className="text-left px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">Couleur</th>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-left px-3 py-2">Slug (id)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((r, i) => (
                    <tr key={i} className="border-t border-line/60 hover:bg-panel2/40">
                      <td className="px-3 py-2">
                        {r.errors.length > 0 ? (
                          <span className="text-rose-400">✗ {r.errors.join(', ')}</span>
                        ) : r.isDuplicate ? (
                          <span className="text-amber">{overwrite ? '↻ Mise à jour' : '⏭ Ignoré'}</span>
                        ) : (
                          <span className="text-emerald-400">✓ Prêt</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-line flex-none"
                            style={{ backgroundColor: r.color }}
                          />
                          <span className="font-mono text-[11px] text-dim">{r.color}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium text-white">{r.name}</td>
                      <td className="px-3 py-2 text-dim font-mono">{r.id}</td>
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
            className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-40 w-fit hover:opacity-90 self-start"
          >
            {submitting ? 'Importation en cours…' : `Importer ${importableCount} marque${importableCount > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Rapport de résultat */}
      {results && (
        <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold text-white mb-1">Rapport d&apos;import :</h4>
          {results.map((r, i) => (
            <p key={i} className={`text-xs ${r.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
              {r.ok ? '✓' : '✗'} <b>{r.name || r.id}</b> {r.ok && r.updated ? '(mise à jour)' : ''}
              {r.error ? ` — ${r.error}` : ' (importée avec succès)'}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
