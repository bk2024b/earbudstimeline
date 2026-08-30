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
    <div className="flex items-start gap-3 border-l-2 border-accent/50 pl-4 py-1 mb-8">
      <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <p className="text-[13.5px] text-dim leading-relaxed m-0">
        <span className="text-fg font-medium">{insight.eyebrow}</span>
        {' — '}
        {insight.text}{' '}
        <Link href={insight.href} className="text-accent hover:underline whitespace-nowrap">
          {insight.cta}
        </Link>
      </p>
    </div>
  );
}
