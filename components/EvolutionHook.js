import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { yearOf } from '@/lib/format';

/**
 * Hook "Evolution / Before-After" — Pattern clé d'exploration chronologique :
 * Affiche immédiatement ce qui a précédé et ce qui a suivi ce modèle précis.
 */
export default function EvolutionHook({ prevModel, currentModel, nextModel, locale }) {
  if (!prevModel && !nextModel) return null;
  const en = locale === 'en';

  return (
    <div className="hardware-card bg-panel p-4 sm:p-5 mb-10">
      <div className="path-indicator text-accent mb-3 text-[11px]">
        {en ? 'Generation Lineage' : 'Lignée générationnelle'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Previous model */}
        {prevModel ? (
          <Link
            href={`/ecouteurs/${prevModel.id}`}
            className="group flex flex-col p-3 rounded-base bg-panel2/40 hover:bg-panel2/80 border border-line/60 hover:border-accent/30 transition-all text-left"
          >
            <div className="flex items-center gap-1.5 text-xs text-dim group-hover:text-accent mb-1">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{en ? 'Came before' : 'Modèle précédent'}</span>
            </div>
            <div className="text-sm font-semibold text-fg group-hover:text-accent truncate">
              {prevModel.name}
            </div>
            <div className="text-[11px] font-mono text-dim mt-0.5">
              {yearOf(prevModel.release_date)}
            </div>
          </Link>
        ) : (
          <div className="p-3 rounded-base border border-dashed border-line/40 text-left opacity-50">
            <div className="text-xs text-dim mb-1">{en ? 'First of its line' : 'Premier de sa lignée'}</div>
            <div className="text-xs text-dim/70">—</div>
          </div>
        )}

        {/* Current model */}
        <div className="flex flex-col p-3 rounded-base bg-accent/10 border border-accent/40 text-left relative overflow-hidden">
          <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider font-bold bg-accent text-ink px-1.5 py-0.5 rounded-sm">
            {en ? 'Current' : 'Actuel'}
          </span>
          <div className="text-xs font-semibold text-accent mb-1">
            {en ? 'You are viewing' : 'Fiche actuelle'}
          </div>
          <div className="text-sm font-bold text-fg truncate">
            {currentModel?.name}
          </div>
          <div className="text-[11px] font-mono text-accent/80 font-medium mt-0.5">
            {yearOf(currentModel?.release_date)}
          </div>
        </div>

        {/* Next model */}
        {nextModel ? (
          <Link
            href={`/ecouteurs/${nextModel.id}`}
            className="group flex flex-col p-3 rounded-base bg-panel2/40 hover:bg-panel2/80 border border-line/60 hover:border-accent/30 transition-all text-left sm:text-right"
          >
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-dim group-hover:text-accent mb-1">
              <span>{en ? 'Came next' : 'Génération suivante'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-sm font-semibold text-fg group-hover:text-accent truncate">
              {nextModel.name}
            </div>
            <div className="text-[11px] font-mono text-dim mt-0.5">
              {yearOf(nextModel.release_date)}
            </div>
          </Link>
        ) : (
          <div className="p-3 rounded-base border border-dashed border-line/40 text-left sm:text-right opacity-50">
            <div className="text-xs text-dim mb-1">{en ? 'Latest generation' : 'Dernière génération'}</div>
            <div className="text-xs text-dim/70">—</div>
          </div>
        )}
      </div>
    </div>
  );
}
