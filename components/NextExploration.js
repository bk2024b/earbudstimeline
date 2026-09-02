import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

// Composant de fin de page décrit dans le doc UX Exploration Hooks :
// "10 — NEXT EXPLORATION" — trois directions (chronologique, plus profond,
// latéral). Ne calcule rien lui-même : reçoit trois objets optionnels déjà
// dérivés par la page (next model, rival model, tech/brand link).
//
// continueItem / sidewaysItem: { title, subtitle, href }
// deeperItem:                  { title, subtitle, href }
export default function NextExploration({ continueItem, deeperItem, sidewaysItem, locale }) {
  const en = locale === 'en';
  const columns = [
    continueItem && {
      ...continueItem,
      eyebrow: en ? 'Continue the story' : "Continuer l'histoire",
    },
    deeperItem && {
      ...deeperItem,
      eyebrow: en ? 'Go deeper' : 'Aller plus loin',
    },
    sidewaysItem && {
      ...sidewaysItem,
      eyebrow: en ? 'Explore sideways' : 'Explorer autrement',
    },
  ].filter(Boolean);

  if (columns.length === 0) return null;

  // Tailwind doit voir les classes complètes dans le code source (JIT) —
  // une classe construite par concaténation ("sm:grid-cols-" + n) ne serait
  // jamais détectée au build.
  const gridClass = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns.length] || 'sm:grid-cols-3';

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <h2 className="text-xs uppercase tracking-[0.12em] font-display font-semibold text-dim">
          {en ? "Where to next?" : 'Et ensuite ?'}
        </h2>
      </div>
      <div className={`grid grid-cols-1 ${gridClass} gap-4`}>
        {columns.map((col) => (
          <Link
            key={col.href}
            href={col.href}
            className="group hardware-card bg-panel p-5 flex flex-col justify-between"
          >
            <div>
              <div className="path-indicator text-accent mb-2.5 text-[11px]">{col.eyebrow}</div>
              <div className="text-sm sm:text-base font-display font-semibold text-fg mb-1.5 leading-snug group-hover:text-accent transition-colors">
                {col.title}
              </div>
              {col.subtitle && <div className="text-xs text-dim leading-relaxed">{col.subtitle}</div>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-accent font-display font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>{en ? 'Explore' : 'Explorer'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
