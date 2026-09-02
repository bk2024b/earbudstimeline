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
    <div className="hardware-card bg-panel p-5 sm:p-6 mb-12">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="path-indicator text-accent">
          {en ? `Also released in ${year}` : `Également sorti en ${year}`}
        </div>
        <span className="font-mono text-[11px] text-accent/90 px-2 py-0.5 border border-accent/20 bg-accent/5 rounded-base font-semibold">
          {year}
        </span>
      </div>
      <h2 className="text-base sm:text-lg font-display font-bold text-fg m-0 mb-4">
        {en ? 'What else happened this year?' : "Qu'est-ce qui existait d'autre à ce moment-là ?"}
      </h2>

      <div className="flex flex-col divide-y divide-line/60">
        {models.map((sibling) => {
          const siblingBrand = brandOf(sibling.brand_id);
          return (
            <Link
              key={sibling.id}
              href={`/ecouteurs/${sibling.id}`}
              className="flex items-center justify-between gap-3 py-3 group hover:bg-panel2/40 px-2 -mx-2 transition-colors rounded-base"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BrandBadge brand={siblingBrand || { name: sibling.brand_id }} size={28} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-fg group-hover:text-accent transition-colors truncate">
                    {sibling.name}
                  </div>
                  <div className="text-xs text-dim truncate">
                    {siblingBrand?.name || sibling.brand_id} {sibling.gamme ? `· ${sibling.gamme}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {sibling.anc && (
                  <span className="text-[10px] bg-accent/10 border border-accent/30 text-accent font-mono font-medium px-2 py-0.5 rounded-base">
                    ANC
                  </span>
                )}
                <span className="text-dim/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 mt-2 border-t border-line/60">
        <Link href={`/annees/${year}`} className="entity-bridge">
          {en ? `Explore all ${year} models →` : `Explorer l'année ${year} complète →`}
        </Link>
      </div>
    </div>
  );
}
