import { Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';

// Bannière fine et discrète — volontairement pas une grosse card, pour
// respecter la contrainte du doc UX : "avoid excessive cards, avoid
// aggressive popups, never interrupt reading". `insight` vient de
// lib/curiosity.js (buildCuriosityInsight) ; le composant se contente
// d'afficher, il ne calcule rien.
export default function CuriosityHook({ insight }) {
  if (!insight) return null;

  return (
    <div className="flex items-start gap-3.5 border-l-2 border-accent bg-accent/[0.03] pl-4 pr-4 py-3 mb-8 rounded-r-base border-y border-r border-line/40">
      <div className="p-1 rounded-base bg-accent/10 shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
      </div>
      <p className="text-[13.5px] text-dim leading-relaxed m-0">
        <span className="text-fg font-semibold signal-glow">{insight.eyebrow}</span>
        {' — '}
        {insight.text}{' '}
        <Link href={insight.href} className="text-accent hover:underline font-medium inline-flex items-center gap-1 whitespace-nowrap ml-1">
          {insight.cta}
        </Link>
      </p>
    </div>
  );
}
