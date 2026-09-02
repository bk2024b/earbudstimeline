'use client';

const OPS = [
  { value: 'eq', label: '= égal à' },
  { value: 'in', label: 'est parmi (liste séparée par virgules)' },
  { value: 'lte', label: '≤ inférieur ou égal' },
  { value: 'lt', label: '< inférieur' },
  { value: 'gte', label: '≥ supérieur ou égal' },
  { value: 'gt', label: '> supérieur' },
  { value: 'between', label: 'entre (2 valeurs séparées par une virgule)' },
  { value: 'contains', label: 'contient (texte)' },
  { value: 'regex', label: 'correspond à une expression régulière' },
];

const FIELD_SUGGESTIONS = [
  'price', 'brand_id', 'marquant', 'anc', 'battery_bud_h', 'battery_case_h',
  'weight_g', 'water_rating', 'bluetooth', 'release_date', 'multipoint',
  'usb_c', 'wireless_charging', 'transparency', 'spatial_audio',
  'microphones', 'charging_time_h', 'type',
];

const NAMED_FILTERS = [
  { value: 'hasHiResCodec', label: 'hasHiResCodec — codec LDAC/aptX détecté' },
  { value: 'hasLowLatencyCodec', label: 'hasLowLatencyCodec — codec faible latence détecté' },
  { value: 'isOpenEarType', label: 'isOpenEarType — type "open-ear" détecté' },
];

export default function GuideFilterEditor({ clauses, onChange }) {
  function updateClause(index, patch) {
    onChange(clauses.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function addFieldClause() {
    onChange([...clauses, { mode: 'field', field: '', op: 'eq', value: '' }]);
  }

  function addNamedClause() {
    onChange([...clauses, { mode: 'named', named: NAMED_FILTERS[0].value }]);
  }

  function removeClause(index) {
    onChange(clauses.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-panel2 border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <p className="text-xs text-white font-semibold">Filtre du catalogue</p>
        <div className="flex gap-2">
          <button type="button" onClick={addFieldClause} className="text-[11px] text-accent border border-accent/30 bg-accent/10 rounded-full px-2.5 py-1 hover:bg-accent/15">
            + Condition sur un champ
          </button>
          <button type="button" onClick={addNamedClause} className="text-[11px] text-accent border border-accent/30 bg-accent/10 rounded-full px-2.5 py-1 hover:bg-accent/15">
            + Fonction nommée
          </button>
        </div>
      </div>
      <p className="text-[11px] text-dim mb-3">
        Toutes les conditions sont combinées avec ET. Aucune condition = tout le catalogue.
      </p>

      <div className="flex flex-col gap-3">
        {clauses.map((clause, index) => (
          <div key={index} className="border border-line/60 rounded-lg p-3 relative">
            <button type="button" onClick={() => removeClause(index)} className="absolute top-2 right-2 text-[11px] text-dim hover:text-rose-400" title="Supprimer">✕</button>

            {clause.mode === 'named' ? (
              <label className="flex flex-col gap-1 pr-6">
                <span className="text-[11px] text-dim">Fonction nommée</span>
                <select
                  value={clause.named}
                  onChange={(e) => updateClause(index, { named: e.target.value })}
                  className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white"
                >
                  {NAMED_FILTERS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Champ</span>
                  <input
                    list="guide-field-suggestions"
                    value={clause.field}
                    onChange={(e) => updateClause(index, { field: e.target.value })}
                    placeholder="ex. price"
                    className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Condition</span>
                  <select
                    value={clause.op}
                    onChange={(e) => updateClause(index, { op: e.target.value })}
                    className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white"
                  >
                    {OPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-dim">Valeur</span>
                  <input
                    value={clause.value}
                    onChange={(e) => updateClause(index, { value: e.target.value })}
                    placeholder={clause.op === 'in' || clause.op === 'between' ? 'ex. apple,samsung' : 'ex. 100'}
                    className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white"
                  />
                </label>
                {clause.op === 'regex' && (
                  <label className="flex flex-col gap-1 sm:col-span-3">
                    <span className="text-[11px] text-dim">Flags regex (optionnel, ex. « i » pour insensible à la casse)</span>
                    <input
                      value={clause.flags || ''}
                      onChange={(e) => updateClause(index, { flags: e.target.value })}
                      placeholder="i"
                      className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white sm:w-32"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        ))}

        {clauses.length === 0 && <p className="text-xs text-dim italic">Aucun filtre — le guide affichera tout le catalogue.</p>}
      </div>

      <datalist id="guide-field-suggestions">
        {FIELD_SUGGESTIONS.map((f) => <option key={f} value={f} />)}
      </datalist>
    </div>
  );
}

// Coerces a raw clause value string into the typed shape guideFilters.js
// expects. Exported so GuideForm.js can call it when serializing to JSON.
export function coerceClauseValue(op, raw) {
  const str = (raw ?? '').toString().trim();
  if (op === 'in') return str.split(',').map((s) => s.trim()).filter(Boolean);
  if (op === 'between') return str.split(',').map((s) => s.trim()).slice(0, 2);
  if (['lte', 'lt', 'gte', 'gt'].includes(op)) return Number(str);
  if (op === 'eq') {
    // No numeric auto-coercion here: evalClause's `eq` already does a
    // string-tolerant comparison (String(raw) === String(value)), so
    // converting "5.3" to the number 5.3 would only change the stored type
    // without changing matching behavior — better to keep exactly what was
    // typed and avoid a surprising round-trip.
    if (str === 'true') return true;
    if (str === 'false') return false;
    return str;
  }
  return str; // contains, regex
}
