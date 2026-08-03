import Link from 'next/link';
import { yearOf } from '@/lib/format';

export default function Waveform({ models, brands }) {
  const colorById = Object.fromEntries(brands.map((b) => [b.id, b.color]));
  const sorted = [...models].sort((a, b) => a.release_date.localeCompare(b.release_date));
  const maxH = Math.max(...sorted.map((m) => Number(m.battery_case_h)));

  return (
    <div className="bg-panel border border-line rounded-2xl px-5 pt-6 pb-4 mb-12">
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-4">
        <h2 className="text-[15px] m-0">Autonomie totale, écouteur par écouteur</h2>
        <p className="m-0 text-dim text-xs">
          Hauteur = autonomie avec boîtier · classé chronologiquement · point ambre = modèle marquant
        </p>
      </div>
      <div className="flex items-end gap-[3px] h-[120px] overflow-x-auto pb-1.5">
        {sorted.map((m) => {
          const h = Math.max(6, Math.round((Number(m.battery_case_h) / maxH) * 100));
          return (
            <Link
              key={m.id}
              href={`/ecouteurs/${m.id}`}
              title={`${m.name} (${yearOf(m.release_date)}) — ${m.battery_case_h} h avec boîtier`}
              className="relative flex-none w-[9px] rounded-t-[3px] rounded-b-[1px] hover:opacity-70 transition-opacity"
              style={{ height: `${h}%`, background: colorById[m.brand_id] }}
            >
              {m.marquant && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber shadow-[0_0_6px_#FFB454]" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="flex gap-4 flex-wrap mt-3.5 text-xs text-dim">
        {brands.map((b) => (
          <span key={b.id}>
            <i className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ background: b.color }} />
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
