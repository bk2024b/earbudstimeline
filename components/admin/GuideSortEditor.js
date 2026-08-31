'use client';

const TYPES = [
  { value: 'number', label: 'Nombre (aussi pour les booléens : true=1, false=0)' },
  { value: 'date', label: 'Date' },
  { value: 'string', label: 'Texte' },
];

const NAMED_COMPUTED = [
  { value: 'hasHiResCodec', label: 'hasHiResCodec — codec LDAC/aptX détecté' },
  { value: 'hasLowLatencyCodec', label: 'hasLowLatencyCodec — codec faible latence détecté' },
  { value: 'isOpenEarType', label: 'isOpenEarType — type "open-ear" détecté' },
];

const FIELD_SUGGESTIONS = [
  'price', 'marquant', 'anc', 'battery_bud_h', 'battery_case_h', 'weight_g',
  'water_rating', 'bluetooth', 'release_date', 'microphones', 'charging_time_h',
];

export default function GuideSortEditor({ rules, onChange }) {
  function updateRule(index, patch) {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addFieldRule() {
    onChange([...rules, { mode: 'field', field: '', type: 'number', direction: 'desc' }]);
  }

  function addComputedRule() {
    onChange([...rules, { mode: 'computed', computed: NAMED_COMPUTED[0].value, direction: 'desc' }]);
  }

  function removeRule(index) {
    onChange(rules.filter((_, i) => i !== index));
  }

  function move(index, delta) {
    const next = [...rules];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="bg-panel2 border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <p className="text-xs text-white font-semibold">Tri du catalogue</p>
        <div className="flex gap-2">
          <button type="button" onClick={addFieldRule} className="text-[11px] text-accent border border-accent/30 bg-accent/10 rounded-full px-2.5 py-1 hover:bg-accent/15">
            + Tri sur un champ
          </button>
          <button type="button" onClick={addComputedRule} className="text-[11px] text-accent border border-accent/30 bg-accent/10 rounded-full px-2.5 py-1 hover:bg-accent/15">
            + Tri sur une fonction nommée
          </button>
        </div>
      </div>
      <p className="text-[11px] text-dim mb-3">
        Les règles s&apos;appliquent dans l&apos;ordre : la première qui départage deux modèles gagne (utile pour les égalités).
      </p>

      <div className="flex flex-col gap-3">
        {rules.map((rule, index) => (
          <div key={index} className="border border-line/60 rounded-lg p-3 relative">
            <div className="absolute top-2 right-2 flex gap-1.5 items-center">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="text-[11px] text-dim hover:text-white disabled:opacity-30" title="Monter">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === rules.length - 1} className="text-[11px] text-dim hover:text-white disabled:opacity-30" title="Descendre">↓</button>
              <button type="button" onClick={() => removeRule(index)} className="text-[11px] text-dim hover:text-rose-400" title="Supprimer">✕</button>
            </div>

            {rule.mode === 'computed' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-16">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Fonction nommée</span>
                  <select value={rule.computed} onChange={(e) => updateRule(index, { computed: e.target.value })} className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white">
                    {NAMED_COMPUTED.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Ordre</span>
                  <select value={rule.direction} onChange={(e) => updateRule(index, { direction: e.target.value })} className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white">
                    <option value="desc">Vrai en premier</option>
                    <option value="asc">Faux en premier</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-16">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Champ</span>
                  <input
                    list="guide-sort-field-suggestions"
                    value={rule.field}
                    onChange={(e) => updateRule(index, { field: e.target.value })}
                    placeholder="ex. battery_bud_h"
                    className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Type</span>
                  <select value={rule.type} onChange={(e) => updateRule(index, { type: e.target.value })} className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Ordre</span>
                  <select value={rule.direction} onChange={(e) => updateRule(index, { direction: e.target.value })} className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white">
                    <option value="desc">Décroissant (plus grand d&apos;abord)</option>
                    <option value="asc">Croissant (plus petit d&apos;abord)</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        ))}

        {rules.length === 0 && <p className="text-xs text-dim italic">Aucun tri — l&apos;ordre du catalogue par défaut sera utilisé.</p>}
      </div>

      <datalist id="guide-sort-field-suggestions">
        {FIELD_SUGGESTIONS.map((f) => <option key={f} value={f} />)}
      </datalist>
    </div>
  );
}
