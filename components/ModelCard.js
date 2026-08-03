import Link from 'next/link';
import { yearOf, fmtH, fmtG } from '@/lib/format';

export default function ModelCard({ m }) {
  return (
    <Link
      href={`/ecouteurs/${m.id}`}
      className="block bg-panel border border-line rounded-xl px-4 pt-4 pb-3.5 hover:border-accent hover:-translate-y-0.5 transition-all"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="m-0 text-[14.5px] font-semibold leading-tight">🎧 {m.name}</h4>
        <span className="font-mono text-[11.5px] text-dim whitespace-nowrap">{yearOf(m.release_date)}</span>
      </div>
      <div className="text-[11.5px] text-dim mb-2.5">
        {m.gamme}
        {m.marquant && (
          <>
            {' '}
            · <span className="text-amber">★</span>
          </>
        )}
      </div>
      <div className="flex gap-3 font-mono text-[11px] text-dim flex-wrap">
        <span>
          Boîtier <b className="text-white font-semibold">{fmtH(m.battery_case_h)}</b>
        </span>
        <span>
          Poids <b className="text-white font-semibold">{fmtG(m.weight_g)}</b>
        </span>
      </div>
    </Link>
  );
}
