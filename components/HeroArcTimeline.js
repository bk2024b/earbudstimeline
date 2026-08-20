import Link from 'next/link';
import Image from 'next/image';
import EarbudsIcon from './EarbudsIcon';

const W = 460;
const H = 170;

function pickHeroModels(models, count = 5) {
  const sorted = [...models].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
  if (sorted.length <= count) return sorted;

  const picks = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (sorted.length - 1));
    picks.push(sorted[idx]);
  }
  return [...new Map(picks.map((m) => [m.id, m])).values()];
}

function bezierPoint(t, p0, p1, p2) {
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
  return { x, y };
}

export default function HeroArcTimeline({ models, brands }) {
  const picks = pickHeroModels(models);
  if (picks.length < 2) return null;

  const colorOf = (id) => brands.find((b) => b.id === id)?.color || '#9A9AA3';
  const p0 = { x: 20, y: H - 20 };
  const p1 = { x: W / 2, y: -10 };
  const p2 = { x: W - 20, y: H - 20 };
  const arcPath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  return (
    <div className="relative hidden sm:block" style={{ width: W, height: H + 90 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute top-0 left-0 w-full" style={{ height: H }}>
        <path d={arcPath} fill="none" stroke="#27272A" strokeWidth="1.5" />
        {picks.map((m, i) => {
          const t = i / (picks.length - 1);
          const pt = bezierPoint(t, p0, p1, p2);
          return <circle key={m.id} cx={pt.x} cy={pt.y} r="4" fill="#22D07A" />;
        })}
      </svg>

      {picks.map((m, i) => {
        const t = i / (picks.length - 1);
        const pt = bezierPoint(t, p0, p1, p2);
        const leftPct = (pt.x / W) * 100;
        const topPx = pt.y;
        return (
          <Link
            key={m.id}
            href={`/ecouteurs/${m.id}`}
            className="absolute flex flex-col items-center gap-1.5 group"
            style={{ left: `${leftPct}%`, top: topPx, transform: 'translate(-50%, 8px)', width: 80 }}
          >
            <span className="sr-only">{m.name}</span>
            <span aria-hidden="true" className="font-mono text-[10px] text-dim group-hover:text-accent transition-colors">
              {new Date(m.release_date).getFullYear()}
            </span>
            <span aria-hidden="true" className="relative w-14 h-14 rounded-xl bg-panel2 border border-line flex items-center justify-center overflow-hidden group-hover:border-accent transition-colors">
              {m.image_url ? (
                <Image src={m.image_url} alt="" fill sizes="56px" className="object-contain p-1.5" />
              ) : (
                <EarbudsIcon color={colorOf(m.brand_id)} className="w-8 h-8" />
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
