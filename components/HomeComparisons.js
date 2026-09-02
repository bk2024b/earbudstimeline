import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import EarbudsIcon from './EarbudsIcon';
import { buildComparisonSlug } from '@/lib/compareSlug';

export default async function HomeComparisons({ pairs, brandOf, locale }) {
  if (pairs.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'comparisonSuggestions' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="path-indicator text-accent text-[11px]">{t('popular')}</div>
        <Link href="/comparaisons" className="text-xs text-accent hover:underline font-mono">
          {tc('seeAll')} →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {pairs.map(({ a, b }) => (
          <div
            key={`${a.id}-${b.id}`}
            className="hardware-card group flex items-center justify-between gap-3 bg-panel p-3.5"
          >
            <div className="flex items-center gap-2 min-w-0 text-sm font-medium">
              <EarbudsIcon color={brandOf(a.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
              <span className="truncate text-fg">{a.name}</span>
              <span className="text-accent font-mono text-xs px-1.5 py-0.5 bg-accent/10 rounded-base shrink-0">{tc('vs')}</span>
              <span className="truncate text-fg">{b.name}</span>
              <EarbudsIcon color={brandOf(b.brand_id)?.color || '#9A9AA3'} className="w-6 h-6 shrink-0" />
            </div>
            <Link
              href={`/comparaisons/${buildComparisonSlug(a.id, b.id)}`}
              className="shrink-0 bg-accent text-ink font-semibold rounded-base px-3 py-1.5 text-xs hover:opacity-90 transition-opacity"
            >
              {tc('compare')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
