'use client';

import { useState, useMemo } from 'react';
import FormField from './FormField';
import { slugify } from '@/lib/slug';

const COMMON_CODECS = ['AAC', 'SBC', 'LDAC', 'aptX', 'aptX Adaptive', 'aptX Lossless', 'LC3', 'LHDC'];
const COMMON_WATER_RATINGS = ['IPX4', 'IP54', 'IP57', 'IPX2', 'IPX7', 'IP68', 'Non résistant'];

export default function EarbudForm({
  action,
  brands = [],
  existingEarbuds = [],
  defaults = {},
  lockId = false,
  submitLabel = 'Enregistrer',
}) {
  const [selectedBrand, setSelectedBrand] = useState(defaults.brand_id || (brands[0]?.id || ''));
  const [name, setName] = useState(defaults.name || '');
  const [customId, setCustomId] = useState(defaults.id || '');
  const [gamme, setGamme] = useState(defaults.gamme || '');
  const [codec, setCodec] = useState(defaults.codec || 'AAC, SBC');
  const [waterRating, setWaterRating] = useState(defaults.water_rating || 'IPX4');

  // Gammes existantes pour la marque sélectionnée
  const availableGammes = useMemo(() => {
    const set = new Set();
    existingEarbuds
      .filter((e) => e.brand_id === selectedBrand && e.gamme)
      .forEach((e) => set.add(e.gamme));
    return Array.from(set).sort();
  }, [existingEarbuds, selectedBrand]);

  // Aperçu du slug calculé
  const generatedSlugPreview = useMemo(() => {
    if (customId) return slugify(customId);
    if (selectedBrand && name) return slugify(`${selectedBrand}-${name}`);
    return '';
  }, [customId, selectedBrand, name]);

  function handleAddCodec(c) {
    const currentCodecs = (codec || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    if (currentCodecs.includes(c)) {
      // Retirer si déjà présent
      const updated = currentCodecs.filter((x) => x !== c);
      setCodec(updated.join(', ') || '—');
    } else {
      // Ajouter
      const filtered = currentCodecs.filter((x) => x !== '—');
      filtered.push(c);
      setCodec(filtered.join(', '));
    }
  }

  return (
    <form action={action} encType="multipart/form-data" className="max-w-xl flex flex-col gap-4">
      {!lockId ? (
        <div className="flex flex-col gap-1">
          <FormField
            label="Identifiant personnalisé (slug, optionnel)"
            name="id"
            placeholder="ex. airpods-pro-3"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
          {generatedSlugPreview && (
            <span className="text-[11px] text-accent font-mono">
              → URL finale : /ecouteurs/<b>{generatedSlugPreview}</b>
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Identifiant (slug)</span>
          <input
            value={defaults.id}
            disabled
            className="bg-panel border border-line rounded-lg px-3 py-2.5 text-dim font-mono text-xs"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Marque</span>
          <select
            name="brand_id"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white"
          >
            <option value="" disabled>
              Choisir...
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Gamme</span>
          <input
            list="gammes-list"
            name="gamme"
            placeholder="ex. AirPods Pro"
            value={gamme}
            onChange={(e) => setGamme(e.target.value)}
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white"
          />
          <datalist id="gammes-list">
            {availableGammes.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          {availableGammes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              <span className="text-[10px] text-dim">Suggestions :</span>
              {availableGammes.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGamme(g)}
                  className="text-[10px] bg-panel px-1.5 py-0.2 rounded border border-line text-dim hover:text-accent"
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <FormField
        label="Nom du modèle"
        name="name"
        placeholder="ex. AirPods Pro 3"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div>
        <label className="block text-xs text-dim mb-1.5">Photo (optionnel)</label>
        {defaults.image_url && (
          <div className="mb-2.5 w-24 h-24 rounded-lg bg-panel2 border border-line flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={defaults.image_url} alt="" className="w-full h-full object-contain p-1" />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
        />
        <p className="text-xs text-dim mt-1.5">
          {defaults.image_url
            ? 'Laisser vide pour conserver la photo actuelle.'
            : "Sans photo, l'icône générique de la marque est utilisée à la place."}
        </p>
      </div>

      <FormField
        label="Accroche (français)"
        name="tagline"
        placeholder="Une phrase courte percutante"
        defaultValue={defaults.tagline}
        required
      />
      <FormField
        label="Accroche (anglais)"
        name="tagline_en"
        placeholder="A short compelling tagline"
        defaultValue={defaults.tagline_en}
        hint="Optionnel — tant qu'elle est vide, la version anglaise du site affiche l'accroche française."
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date de sortie"
          name="release_date"
          type="date"
          defaultValue={defaults.release_date}
          required
        />
        <FormField
          label="Prix au lancement ($)"
          name="price"
          type="number"
          step="1"
          placeholder="ex. 249"
          defaultValue={defaults.price ?? ''}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Autonomie écouteur (h)"
          name="battery_bud_h"
          type="number"
          step="0.1"
          placeholder="ex. 6"
          defaultValue={defaults.battery_bud_h}
          required
        />
        <FormField
          label="Autonomie totale (h)"
          name="battery_case_h"
          type="number"
          step="0.1"
          placeholder="ex. 30"
          defaultValue={defaults.battery_case_h}
          required
        />
        <FormField
          label="Poids / écouteur (g)"
          name="weight_g"
          type="number"
          step="0.01"
          placeholder="ex. 5.3"
          defaultValue={defaults.weight_g}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Certification Eau avec presets */}
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Certification eau / étanchéité</span>
          <input
            name="water_rating"
            value={waterRating}
            onChange={(e) => setWaterRating(e.target.value)}
            placeholder="ex. IPX4"
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white"
          />
          <div className="flex flex-wrap gap-1 mt-0.5">
            {COMMON_WATER_RATINGS.map((w) => (
              <button
                type="button"
                key={w}
                onClick={() => setWaterRating(w)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  waterRating === w ? 'bg-accent/20 border-accent text-accent' : 'bg-panel border-line text-dim hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <FormField label="Puce" name="chip" placeholder="ex. Apple H2 ou —" defaultValue={defaults.chip || '—'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Bluetooth" name="bluetooth" placeholder="ex. 5.3" defaultValue={defaults.bluetooth || '5.3'} required />

        {/* Codecs avec presets cliquables */}
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Codecs supportés</span>
          <input
            name="codec"
            value={codec}
            onChange={(e) => setCodec(e.target.value)}
            placeholder="ex. AAC, SBC, LDAC"
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white"
          />
          <div className="flex flex-wrap gap-1 mt-0.5">
            {COMMON_CODECS.map((c) => {
              const isActive = (codec || '').split(',').map((x) => x.trim()).includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => handleAddCodec(c)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    isActive ? 'bg-accent text-ink border-accent font-semibold' : 'bg-panel border-line text-dim hover:text-white'
                  }`}
                >
                  {isActive ? `✓ ${c}` : `+ ${c}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-6 py-2 flex-wrap border-t border-line/40 mt-1">
        <label className="flex items-center gap-2 text-sm text-dim cursor-pointer hover:text-white select-none">
          <input type="checkbox" name="anc" defaultChecked={defaults.anc} className="accent-accent cursor-pointer" />
          Réduction de bruit active (ANC)
        </label>
        <label className="flex items-center gap-2 text-sm text-dim cursor-pointer hover:text-white select-none">
          <input type="checkbox" name="usb_c" defaultChecked={defaults.usb_c !== false} className="accent-accent cursor-pointer" />
          USB-C
        </label>
        <label className="flex items-center gap-2 text-sm text-dim cursor-pointer hover:text-white select-none">
          <input type="checkbox" name="multipoint" defaultChecked={defaults.multipoint} className="accent-accent cursor-pointer" />
          Multipoint
        </label>
        <label className="flex items-center gap-2 text-sm text-dim cursor-pointer hover:text-white select-none">
          <input type="checkbox" name="marquant" defaultChecked={defaults.marquant} className="accent-accent cursor-pointer" />
          ★ Modèle marquant
        </label>
      </div>

      <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm mt-2 self-start hover:opacity-90">
        {submitLabel}
      </button>
    </form>
  );
}
