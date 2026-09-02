'use client';

export default function GuidePairListEditor({ label, hint, items, onChange, keyLabel, valueLabel, addLabel }) {
  function updateItem(index, field, value) {
    const next = items.map((item, i) => (i === index ? [field === 'key' ? value : item[0], field === 'value' ? value : item[1]] : item));
    onChange(next);
  }

  function addItem() {
    onChange([...items, ['', '']]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-panel2 border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-white font-semibold">{label}</p>
        <button type="button" onClick={addItem} className="text-[11px] text-accent border border-accent/30 bg-accent/10 rounded-full px-2.5 py-1 hover:bg-accent/15">
          + {addLabel}
        </button>
      </div>
      {hint && <p className="text-[11px] text-dim mb-3">{hint}</p>}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="border border-line/60 rounded-lg p-3 flex flex-col gap-2 relative">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 text-[11px] text-dim hover:text-rose-400"
              title="Supprimer"
            >
              ✕
            </button>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-dim">{keyLabel}</span>
              <input
                value={item[0] || ''}
                onChange={(e) => updateItem(index, 'key', e.target.value)}
                className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white pr-6"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-dim">{valueLabel}</span>
              <textarea
                rows={2}
                value={item[1] || ''}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
                className="bg-panel border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-white resize-y"
              />
            </label>
          </div>
        ))}

        {items.length === 0 && <p className="text-xs text-dim italic">Aucun élément — cliquez sur « {addLabel} » pour en ajouter un.</p>}
      </div>
    </div>
  );
}
