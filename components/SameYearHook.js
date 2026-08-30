import { yearOf } from '@/lib/format';
import { Link } from '@/i18n/navigation';
import BrandBadge from './BrandBadge';

// Hook "Same Year" — pattern décrit dans le doc UX Exploration Hooks :
// "Also released in {year} — what else happened this year?". Reçoit une
// liste déjà filtrée (voir lib/sameYear.js) et un résolveur de marque déjà
// chargée sur la page (même pattern que ComparisonSuggestions), aucune
// requête ici.
export default function SameYearHook({ year, models, brandOf, locale }) {
  if (!year || !models || models.length === 0) return null;
  const en = locale === 'en';

  return (
    <div className="bg-panel border border-line rounded-base p-5 mb-12">
      <div className="path-indicator text-accent mb-1.5">
        {en ? `Also released in ${year}` : `Également sorti en ${year}`}
      </div>
      <h2 className="text-[15px] font-semibold m-0 mb-4">
        {en ? 'What else happened this year?' : "Qu'est-ce qui existait d'autre à ce moment-là ?"}
      </h2>

      <div className="flex flex-col divide-y divide-line">
        {models.map((sibling) => {
          const siblingBrand = brandOf(sibling.brand_id);
          return (
            <Link
              key={sibling.id}
              href={`/ecouteurs/${sibling.id}`}
              className="flex items-center justify-between gap-3 py-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BrandBadge brand={siblingBrand || { name: sibling.brand_id }} size={26} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-fg truncate">{sibling.name}</div>
                  <div className="text-xs text-dim truncate">
                    {siblingBrand?.name || sibling.brand_id} · {sibling.gamme}
                  </div>
                </div>
              </div>
              {sibling.anc && (
                <span className="text-[10px] bg-panel2 border border-line text-accent px-1.5 py-0.2 rounded shrink-0">
                  ANC
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <Link href={`/annees/${year}`} className="entity-bridge mt-4">
        {en ? `Explore ${year} →` : `Explorer ${year} →`}
      </Link>
    </div>
  );
}
