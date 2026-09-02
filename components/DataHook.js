import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Hook "Data / Spec -> Curiosity" :
 * Transforme une spec en micro-découverte historique.
 */
export default function DataHook({ label, value, comparisonText, href, ctaText, locale }) {
  if (!label || !value) return null;
  const en = locale === 'en';

  return (
    <div className="hardware-card bg-panel p-4 my-6 border-l-2 border-l-accent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-base bg-accent/10 shrink-0 mt-0.5">
          <TrendingUp className="w-4 h-4 text-accent" />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-dim">
            {label} · <span className="text-fg font-semibold">{value}</span>
          </div>
          {comparisonText && (
            <p className="text-xs sm:text-sm text-dim mt-0.5 m-0 leading-relaxed">
              {comparisonText}
            </p>
          )}
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="entity-bridge shrink-0 self-start sm:self-center"
        >
          <span>{ctaText || (en ? 'Explore evolution →' : "Explorer l'évolution →")}</span>
        </Link>
      )}
    </div>
  );
}
