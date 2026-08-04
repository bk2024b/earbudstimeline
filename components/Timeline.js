import Link from 'next/link';

export default function Timeline({ models, brands }) {
  const colorById = Object.fromEntries(brands.map((b) => [b.id, b.color]));

  const byYear = {};
  [...models]
    .sort((a, b) => a.release_date.localeCompare(b.release_date))
    .forEach((m) => {
      const y = m.release_date.slice(0, 4);
      // Garde le premier modèle de l'année, remplacé par un modèle marquant si l'année en a un.
      if (!byYear[y] || (m.marquant && !byYear[y].marquant)) byYear[y] = m;
    });
  const nodes = Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));
  const lastYear = nodes[nodes.length - 1]?.[0];

  return (
    <div className="bg-panel border border-line rounded-2xl px-5 pt-6 pb-5 mb-12">
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-6">
        <h2 className="text-[15px] m-0">La timeline des écouteurs</h2>
        <p className="m-0 text-dim text-xs">Un modèle par année · cliquez pour voir sa fiche</p>
      </div>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {nodes.map(([year, m], i) => {
          const isLast = year === lastYear;
          return (
            <Link
              key={year}
              href={`/ecouteurs/${m.id}`}
              className="flex flex-col items-center gap-3 shrink-0 group"
              style={{ width: 108 }}
            >
              <div className="flex items-center w-full">
                <span className={`h-px flex-1 ${i === 0 ? 'opacity-0' : 'bg-line'}`} />
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-transform group-hover:scale-125 ${
                    isLast ? 'bg-accent border-accent shadow-[0_0_10px_#22D07A]' : 'bg-ink'
                  }`}
                  style={!isLast ? { borderColor: colorById[m.brand_id] } : undefined}
                />
                <span className={`h-px flex-1 ${i === nodes.length - 1 ? 'opacity-0' : 'bg-line'}`} />
              </div>
              <div className="text-center px-1">
                <div className={`font-mono text-xs mb-0.5 ${isLast ? 'text-accent' : 'text-dim'}`}>{year}</div>
                <div className="text-[11.5px] leading-tight line-clamp-2">{m.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
