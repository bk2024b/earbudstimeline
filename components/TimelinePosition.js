import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { yearOf } from '@/lib/format';

export default async function TimelinePosition({ prev, current, next, gammeName, locale }) {
  const t = await getTranslations({ locale, namespace: 'timelinePosition' });

  const items = [
    prev && { m: prev, state: 'prev' },
    { m: current, state: 'current' },
    next && { m: next, state: 'next' },
  ].filter(Boolean);

  return (
    <div className="bg-panel border border-line rounded-base p-5">
      <h2 className="text-sm font-semibold mb-1">{t('title')}</h2>
      <p className="text-dim text-xs mb-5">{gammeName}</p>
      <div className="flex flex-col" data-orientation="vertical">
        {items.map((item, i) => {
          const isCurrent = item.state === 'current';
          const isLast = i === items.length - 1;
          const inner = (
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="timeline-line-point shrink-0 mt-1" data-active={isCurrent} />
                {!isLast && <span className="w-px flex-1 bg-line my-1" style={{ minHeight: 26 }} />}
              </div>
              <div className={isLast ? 'pb-0' : 'pb-6'}>
                <div className={`font-mono text-[11px] mb-0.5 ${isCurrent ? 'text-accent' : 'text-dim'}`}>
                  {yearOf(item.m.release_date)}
                  {item.state === 'prev' && ` · ${t('prev')}`}
                  {item.state === 'next' && ` · ${t('next')}`}
                </div>
                <div className={`text-sm leading-snug ${isCurrent ? 'font-semibold text-fg' : 'text-dim'}`}>
                  {item.m.name}
                </div>
              </div>
            </div>
          );
          return isCurrent ? (
            <div key={item.m.id}>{inner}</div>
          ) : (
            <Link key={item.m.id} href={`/ecouteurs/${item.m.id}`} className="hover:opacity-80 transition-opacity">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
