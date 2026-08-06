'use client';

import { useState } from 'react';
import { matchEarbudByFilename } from '@/lib/slug';
import { bulkUploadImages } from '@/app/admin/(dashboard)/earbuds/actions';

export default function BulkImageMatcher({ earbuds, brands }) {
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const brandName = (id) => brands.find((b) => b.id === id)?.name || id;

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const newRows = files.map((file) => {
      const match = matchEarbudByFilename(file.name, earbuds);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        earbudId: match?.id || '',
        matched: Boolean(match),
      };
    });
    setRows(newRows);
    setResults(null);
  }

  function updateRow(index, earbudId) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, earbudId } : r)));
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const toSend = rows.filter((r) => r.earbudId);
    if (toSend.length === 0) return;
    setSubmitting(true);
    const fd = new FormData();
    toSend.forEach((r) => {
      fd.append('files', r.file);
      fd.append('earbudIds', r.earbudId);
    });
    const res = await bulkUploadImages(fd);
    setResults(res);
    setSubmitting(false);
    setRows((prev) => prev.filter((r) => !r.earbudId || res.find((x) => x.filename === r.file.name && !x.ok)));
  }

  const matchedCount = rows.filter((r) => r.earbudId).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-xs text-dim mb-1.5">Sélectionner plusieurs photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
        />
        <p className="text-xs text-dim mt-1.5">
          Astuce : nomme tes fichiers avec l&apos;id (<code>app3.jpg</code>) ou le nom du modèle (<code>airpods-pro-3.jpg</code>)
          pour un rattachement automatique.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div
              key={`${row.file.name}-${i}`}
              className={`flex items-center gap-3 bg-panel border rounded-xl px-3 py-2.5 ${
                row.matched ? 'border-line' : 'border-amber/50'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.previewUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-panel2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-dim truncate">{row.file.name}</div>
                <select
                  value={row.earbudId}
                  onChange={(e) => updateRow(i, e.target.value)}
                  className="mt-1 w-full bg-panel2 border border-line rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="">— Ignorer ce fichier —</option>
                  {brands.map((b) => (
                    <optgroup key={b.id} label={b.name}>
                      {earbuds
                        .filter((e) => e.brand_id === b.id)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.id})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {!row.matched && (
                  <p className="text-[11px] text-amber mt-1">Aucune correspondance automatique trouvée</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-dim hover:text-rose-400 shrink-0"
              >
                Retirer
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || matchedCount === 0}
            className="mt-2 bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 w-fit"
          >
            {submitting ? 'Import en cours…' : `Importer ${matchedCount} photo${matchedCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {results && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          {results.map((r, i) => (
            <p key={i} className={`text-xs ${r.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
              {r.ok ? '✓' : '✗'} {r.filename} → {r.earbudId} {r.error ? `(${r.error})` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
