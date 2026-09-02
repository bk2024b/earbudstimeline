import { Cpu, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Hook "Technology / Innovation -> Guide" :
 * Relie une caractéristique technologique (ANC, codec, spatial...) à son histoire & guide.
 */
export default function TechnologyHook({ techName, description, yearEra, href, locale }) {
  if (!techName) return null;
  const en = locale === 'en';

  return (
    <div className="hardware-card bg-panel p-5 my-8 border border-line">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-accent" />
          <span className="path-indicator text-accent text-[11px]">
            {en ? 'Key Technology' : 'Technologie clé'}
          </span>
        </div>
        {yearEra && (
          <span className="font-mono text-[10px] text-dim px-2 py-0.5 border border-line bg-panel2 rounded-base">
            {yearEra}
          </span>
        )}
      </div>

      <h3 className="text-base font-display font-bold text-fg mb-1">
        {techName}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-dim mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {href && (
        <div className="pt-3 border-t border-line/50">
          <Link href={href} className="entity-bridge">
            {en ? `Explore ${techName} history & timeline →` : `Explorer l'histoire et la timeline ${techName} →`}
          </Link>
        </div>
      )}
    </div>
  );
}
