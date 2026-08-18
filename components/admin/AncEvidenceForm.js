'use client';

import { useState } from 'react';
import { saveAncEvidence } from '@/app/admin/(dashboard)/anc/actions';

const environments = ['airplane', 'train', 'traffic', 'office', 'voices', 'low_frequency'];
const measurementTypes = ['qualitative_environment', 'db_reduction', 'frequency_response', 'laboratory_measurement', 'editorial_test'];
const sourceTypes = ['laboratory', 'editorial_test', 'community', 'manufacturer'];
const confidenceLevels = ['high', 'medium', 'low'];

export default function AncEvidenceForm({ earbudId }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form action={saveAncEvidence} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="hidden" name="earbud_id" value={earbudId} />
      <input type="hidden" name="metric" value="anc" />

      <label className="text-xs text-dim">
        Environnement *
        <select name="noise_category" required className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Sélectionner…</option>
          {environments.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label className="text-xs text-dim">
        Valeur *
        <input name="value" required placeholder="ex. exceptional, 28, excellent" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white" />
      </label>

      <label className="text-xs text-dim">
        URL source *
        <input name="source_url" type="url" required placeholder="https://…" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white" />
      </label>

      <label className="text-xs text-dim">
        Nom de la source
        <input name="source_name" placeholder="RTINGS, SoundGuys…" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white" />
      </label>

      <label className="text-xs text-dim">
        Type de mesure
        <select name="measurement_type" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Sélectionner…</option>
          {measurementTypes.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label className="text-xs text-dim">
        Type de source
        <select name="source_type" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Sélectionner…</option>
          {sourceTypes.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label className="text-xs text-dim md:col-span-2">
        Contexte de mesure
        <input name="measurement_context" placeholder="airplane cabin / accelerating trucks…" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white" />
      </label>

      <div className="md:col-span-2">
        <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-xs text-accent hover:underline">
          {showAdvanced ? 'Masquer' : 'Afficher'} les champs avancés
        </button>
      </div>

      {showAdvanced && (
        <>
          <label className="text-xs text-dim">
            Confiance
            <select name="confidence" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Sélectionner…</option>
              {confidenceLevels.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="text-xs text-dim md:col-span-1">
            Notes
            <textarea name="notes" rows="3" placeholder="Résumé factuel de ce que démontre la source…" className="mt-1 w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white" />
          </label>
        </>
      )}

      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm">Enregistrer la preuve</button>
      </div>
    </form>
  );
}
