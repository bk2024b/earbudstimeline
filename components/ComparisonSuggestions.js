import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { yearOf } from '@/lib/format';
import { buildComparisonSlug } from '@/lib/compareSlug';

export default async function ComparisonSuggestions({ model, suggestions, bullets, brandOf, locale }) {
  if (suggestions.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'comparisonSuggestions' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const primary = suggestions[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
      <div className="bg-panel border border-line rounded-base p-5 glow-accent-hover transition-shadow">
        <h2 className="text-[15px] m-0 mb-3.5">
          {t.rich('comparedTo', {
            name: primary.model.name,
            accent: (chunks) => <span className="text-accent">{chunks}</span>,
          })}
        </h2>
        {bullets.length === 0 ? (
          <p className="text-dim text-[13.5px]">{t('closeSpecs')}</p>
        ) : (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px]">
                <span
                  className={`font-mono text-xs mt-0.5 shrink-0 ${
                    b.sign === '+' ? 'text-accent' : b.sign === '-' ? 'text-rose-400' : 'text-dim'
                  }`}
                >
                  {b.sign}
                </span>
                <span className="text-dim">{b.text}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/comparaisons/${buildComparisonSlug(model.id, primary.model.id)}`}
          className="inline-block mt-4 text-accent text-xs hover:underline"
        >
          {t('seeFull')}
        </Link>
      </div>

      <div className="bg-panel border border-line rounded-base p-5 glow-accent-hover transition-shadow">
        <h2 className="text-[15px] m-0 mb-3.5">{t('popular')}</h2>
        <div className="flex flex-col gap-2">
          {suggestions.map(({ model: other, reason }) => {
            const brand = brandOf(other.brand_id);
            return (
              <div
                key={other.id}
                className="flex items-center justify-between gap-3 bg-panel2 border border-line rounded-xl px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="m-0 text-[13.5px] truncate">
                    {model.name} <span className="text-dim">{tc('vs')}</span> {other.name}
                  </p>
                  <p className="m-0 text-dim text-[11px]">
                    {reason} · {brand?.name || other.brand_id} · {yearOf(other.release_date)}
                  </p>
                </div>
                <Link
                  href={`/comparaisons/${buildComparisonSlug(model.id, other.id)}`}
                  className="shrink-0 bg-accent text-ink font-semibold rounded-lg px-3 py-1.5 text-xs"
                >
                  {tc('compare')}
                </Link>
              </div>
            );
          })}
        </div>
        <Link href="/comparaisons" className="inline-block mt-4 text-accent text-xs hover:underline">
          {t('seeAll')}
        </Link>
      </div>
    </div>
  );
}
