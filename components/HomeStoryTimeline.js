import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { fmtH } from '@/lib/format';
import EarbudsIcon from './EarbudsIcon';

/**
 * HomeStoryTimeline — Composant signature Sonic Chronology
 * Timeline zigzag sur desktop avec années géantes et cards hardware.
 */
export default function HomeStoryTimeline({ entries, colorById, locale }) {
  if (!entries || entries.length === 0) return null;
  const en = locale === 'en';

  return (
    <div className="w-full mb-16 sm:mb-24">
      {/* Desktop/tablette : zigzag */}
      <div className="hidden md:block relative max-w-4xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 timeline-line" />
        {entries.map((entry, i) => {
          const reverse = i % 2 === 1;
          const isLast = i === entries.length - 1;
          return (
            <div
              key={entry.year}
              className={`relative flex items-center justify-between w-full group ${isLast ? '' : 'mb-16 lg:mb-24'} ${
                reverse ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-5/12 ${reverse ? 'text-left pl-8' : 'text-right pr-8'}`}>
                <div className="font-display font-bold text-5xl lg:text-6xl text-fg opacity-25 group-hover:opacity-100 group-hover:text-accent transition-all duration-500">
                  {entry.year}
                </div>
              </div>
              <span
                className="timeline-line-point absolute left-1/2 -translate-x-1/2 z-10 group-hover:bg-accent group-hover:border-accent"
                data-active={isLast && !entry.model ? 'false' : undefined}
              />
              <div className={`w-5/12 ${reverse ? 'pr-8' : 'pl-8'}`}>
                {entry.model ? (
                  <Link
                    href={`/ecouteurs/${entry.model.id}`}
                    className="hardware-card flex gap-4 items-center bg-panel p-4 lg:p-5"
                  >
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 bg-panel2 shrink-0 overflow-hidden flex items-center justify-center rounded-base">
                      {entry.model.image_url ? (
                        <Image
                          src={entry.model.image_url}
                          alt={entry.model.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1 floating-hardware"
                        />
                      ) : (
                        <EarbudsIcon color={colorById?.[entry.model.brand_id] || '#9A9AA3'} className="w-9 h-9" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-accent font-semibold mb-0.5">
                        {entry.model.brand_id}
                      </div>
                      <h3 className="font-display font-bold text-base lg:text-lg mb-0.5 truncate text-fg group-hover:text-accent transition-colors">
                        {entry.model.name}
                      </h3>
                      <p className="text-dim text-xs mb-1.5 truncate">{entry.model.gamme}</p>
                      {entry.model.battery_case_h && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-accent">
                          {fmtH(entry.model.battery_case_h)} {en ? 'battery' : "d'autonomie"}
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className={reverse ? '' : 'text-right'}>
                    <h3 className="font-display font-bold text-2xl text-dim mb-1">
                      {en ? 'Next Gen…' : 'Prochaine génération…'}
                    </h3>
                    <p className="text-dim/50 text-sm font-mono">{en ? 'The future of sound.' : "L'avenir du son."}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile : timeline verticale */}
      <div className="md:hidden flex flex-col max-w-md mx-auto" data-orientation="vertical">
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          return (
            <div key={entry.year} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="timeline-line-point shrink-0 mt-1.5" />
                {!isLast && <span className="w-px flex-1 bg-line my-1" style={{ minHeight: 24 }} />}
              </div>
              <div className={isLast ? 'pb-0' : 'pb-7'}>
                <div className="font-mono text-[11px] font-bold text-accent mb-1">{entry.year}</div>
                {entry.model ? (
                  <Link
                    href={`/ecouteurs/${entry.model.id}`}
                    className="hardware-card flex gap-3 items-center bg-panel p-3.5"
                  >
                    <div className="relative w-12 h-12 rounded-base bg-panel2 shrink-0 overflow-hidden flex items-center justify-center">
                      {entry.model.image_url ? (
                        <Image src={entry.model.image_url} alt={entry.model.name} fill sizes="48px" className="object-contain" />
                      ) : (
                        <EarbudsIcon color={colorById?.[entry.model.brand_id] || '#9A9AA3'} className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-fg truncate">{entry.model.name}</div>
                      <div className="text-xs text-dim truncate">{entry.model.gamme}</div>
                    </div>
                  </Link>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-dim">{en ? 'Next Gen…' : 'Prochaine génération…'}</div>
                    <div className="text-xs text-dim/50">{en ? 'The future of sound.' : "L'avenir du son."}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
