'use client';

/**
 * DesignBibleTimeline — Sonic Chronos visual timeline
 *
 * Vertical centred-axis layout, alternating left/right nodes.
 * Purely cosmetic/editorial — real product data comes from the
 * curated ENTRIES array below. Placed ABOVE the interactive
 * database timeline on /timeline.
 */

const ENTRIES = [
  {
    year: '2016',
    side: 'right', // card on the right, year on the left
    items: [
      {
        name: 'AirPods',
        subtitle: 'First generation',
        feature: { icon: '◉', label: 'W1 Chip' },
        highlight: false,
      },
    ],
  },
  {
    year: '2019',
    side: 'left', // card on the left, year on the right
    items: [
      {
        name: 'AirPods Pro',
        subtitle: 'Active Noise Cancellation',
        feature: { icon: '⟁', label: 'H1 Chip' },
        highlight: true,
      },
      {
        name: 'Sony WF-1000XM3',
        subtitle: 'Industry-leading ANC',
        feature: { icon: '⚡', label: '24 h Battery' },
        highlight: false,
      },
    ],
  },
  {
    year: '2022',
    side: 'right',
    items: [
      {
        name: 'AirPods Pro 2',
        subtitle: '2× Better ANC',
        feature: { icon: '◉', label: 'H2 Chip' },
        highlight: false,
      },
    ],
  },
  {
    year: '2024',
    side: 'left',
    items: null, // "coming soon" node
    label_en: 'Next Gen…',
    label_fr: 'Prochaine génération…',
    sublabel_en: 'The future of audio.',
    sublabel_fr: "L'avenir de l'audio.",
  },
];

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function ProductCard({ item }) {
  return (
    <div
      className={[
        'rounded-xl border p-5 cursor-pointer transition-all duration-300 group/card',
        item.highlight
          ? 'bg-[#141416] border-[#22D07A]/30 relative overflow-hidden'
          : 'bg-[#141416] border-white/5 hover:border-[#22D07A]/40',
      ].join(' ')}
    >
      {item.highlight && (
        <div className="absolute inset-0 bg-[#22D07A]/[0.04] pointer-events-none" />
      )}
      <div className="flex gap-4 items-center relative z-10">
        {/* Placeholder visual block */}
        <div
          className="shrink-0 w-20 h-20 rounded-lg bg-[#0E0E10] border border-white/8 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-3xl opacity-30 select-none">{item.feature.icon}</span>
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-[#E5E2E1] mb-0.5 tracking-tight">
            {item.name}
          </h3>
          <p className="text-xs text-[#9A9AA3] mb-2">{item.subtitle}</p>
          <span className="inline-flex items-center gap-1.5 text-[#22D07A] text-[11px] font-semibold tracking-widest uppercase">
            <span aria-hidden="true">{item.feature.icon}</span>
            {item.feature.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function YearLabel({ year, align }) {
  return (
    <div className={`w-5/12 ${align === 'right' ? 'text-right pr-8' : 'text-left pl-8'}`}>
      <div
        className="font-display font-bold text-[clamp(48px,7vw,80px)] leading-none text-[#E5E2E1]
                   opacity-[0.12] group-hover:opacity-100 transition-opacity duration-500
                   tracking-[-0.04em] pointer-events-none select-none"
      >
        {year}
      </div>
    </div>
  );
}

function TimelineNode({ active }) {
  return (
    <div
      className={[
        'absolute left-1/2 -translate-x-1/2 z-10',
        'w-4 h-4 rounded-full border-2 transition-all duration-300',
        active
          ? 'border-[#22D07A] bg-[#22D07A] shadow-[0_0_16px_rgba(34,208,122,0.6)]'
          : 'border-white/20 bg-[#131313] group-hover:border-[#22D07A] group-hover:shadow-[0_0_12px_rgba(34,208,122,0.4)]',
      ].join(' ')}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────

export default function DesignBibleTimeline({ locale = 'fr' }) {
  const isFr = locale !== 'en';

  return (
    <section className="w-full mb-16" aria-label={isFr ? 'Repères historiques clés' : 'Key historical milestones'}>
      {/* Section header */}
      <div className="mb-10">
        <p className="text-[10px] font-mono tracking-[3px] uppercase text-[#22D07A] mb-2">
          {isFr ? 'Chronologie éditoriale' : 'Editorial Milestones'}
        </p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#E5E2E1] tracking-tight">
          {isFr
            ? 'Les moments qui ont tout changé'
            : 'The moments that changed everything'}
        </h2>
      </div>

      {/* Timeline container */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col pb-8">

        {/* Vertical axis */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(34,208,122,0.5) 30%, rgba(34,208,122,0.5) 70%, rgba(255,255,255,0.04))',
          }}
          aria-hidden="true"
        />

        {ENTRIES.map((entry, ei) => {
          const isLastEntry = ei === ENTRIES.length - 1;
          const cardOnRight = entry.side === 'right';

          return (
            <div
              key={entry.year}
              className={[
                'relative flex items-start justify-between w-full group',
                !isLastEntry ? 'mb-20' : 'mb-0',
                !cardOnRight ? 'flex-row-reverse' : '',
              ].join(' ')}
            >
              {/* Year label */}
              <YearLabel year={entry.year} align={cardOnRight ? 'right' : 'left'} />

              {/* Central node */}
              <TimelineNode active={entry.items?.[0]?.highlight ?? false} />

              {/* Card(s) column */}
              <div className={`w-5/12 ${cardOnRight ? 'pl-8' : 'pr-8'} flex flex-col gap-3 pt-1`}>
                {entry.items ? (
                  entry.items.map((item) => (
                    <ProductCard key={item.name} item={item} />
                  ))
                ) : (
                  /* "Next Gen" placeholder */
                  <div className={cardOnRight ? '' : 'text-right'}>
                    <h3 className="font-display font-semibold text-2xl text-[#9A9AA3] mb-1 tracking-tight">
                      {isFr ? entry.label_fr : entry.label_en}
                    </h3>
                    <p className="text-sm text-[#9A9AA3]/50">
                      {isFr ? entry.sublabel_fr : entry.sublabel_en}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Separator before the interactive timeline */}
      <div className="mt-16 mb-2 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] font-mono tracking-[3px] uppercase text-[#4B5150]">
          {isFr ? 'Timeline complète et interactive' : 'Full interactive timeline'}
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
    </section>
  );
}
