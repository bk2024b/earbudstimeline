'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ConfirmSubmitButton from './ConfirmSubmitButton';
import { deleteGuide, toggleGuideStatus } from '@/app/admin/(dashboard)/guides/actions';

export default function GuidesManager({ guides = [] }) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all | published | draft | standard | special

  const filteredGuides = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guides.filter((g) => {
      if (filterTab === 'published' && g.status !== 'published') return false;
      if (filterTab === 'draft' && g.status !== 'draft') return false;
      if (filterTab === 'special' && g.render_variant === 'standard') return false;
      if (filterTab === 'standard' && g.render_variant !== 'standard') return false;
      if (q) {
        const matchTitle = g.title_en?.toLowerCase().includes(q) || g.title_fr?.toLowerCase().includes(q);
        const matchSlug = g.slug?.toLowerCase().includes(q);
        if (!matchTitle && !matchSlug) return false;
      }
      return true;
    });
  }, [guides, search, filterTab]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-3">
        <div className="relative">
          <input
            type="search"
            placeholder="Rechercher un guide par titre, identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-dim outline-none focus:border-accent"
          />
          <span className="absolute left-3 top-2.5 text-xs text-dim">🔍</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-line/50">
          <span className="text-dim text-[11px]">Filtrer :</span>
          {[
            ['all', `Tous (${guides.length})`],
            ['published', `Publiés (${guides.filter((g) => g.status === 'published').length})`],
            ['draft', `Brouillons (${guides.filter((g) => g.status === 'draft').length})`],
            ['special', `Rendu spécial (${guides.filter((g) => g.render_variant !== 'standard').length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterTab(key)}
              className={`px-2.5 py-1 rounded-full border transition-colors ${
                filterTab === key ? 'bg-accent/15 border-accent text-accent font-medium' : 'border-line text-dim hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredGuides.map((g) => {
          const isPublished = g.status === 'published';
          const isSpecial = g.render_variant !== 'standard';

          return (
            <div key={g.slug} className="flex items-center justify-between gap-3 bg-panel border border-line rounded-xl p-3 sm:p-4 hover:border-line/80 transition-colors flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm truncate">{g.title_en}</span>
                  {isSpecial && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-amber/15 text-amber border border-amber/40" title="Rendu bespoke, non éditable via ce formulaire">
                      {g.render_variant}
                    </span>
                  )}

                  <form action={toggleGuideStatus.bind(null, g.slug, g.status)} className="inline">
                    <button
                      type="submit"
                      title={isPublished ? 'Cliquer pour passer en brouillon' : 'Cliquer pour publier'}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition-all hover:scale-105 ${
                        isPublished
                          ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400 hover:bg-rose-400/15 hover:border-rose-400/40 hover:text-rose-400'
                          : 'bg-amber/15 border-amber/40 text-amber hover:bg-emerald-400/15 hover:border-emerald-400/40 hover:text-emerald-400'
                      }`}
                    >
                      {isPublished ? '● Publié' : '○ Brouillon'}
                    </button>
                  </form>
                </div>

                <div className="text-xs text-dim flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="font-mono text-[11px]">{g.slug}</span>
                  <span>·</span>
                  <span>priorité {g.priority}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {isPublished && (
                  <a href={`/en/guides/${g.slug}`} target="_blank" rel="noreferrer" title="Voir le guide publié" className="text-xs text-dim hover:text-white px-2 py-1 rounded bg-panel2 border border-line/60 flex items-center gap-1">
                    <span>↗</span>
                    <span className="hidden sm:inline">Voir</span>
                  </a>
                )}

                <Link href={`/admin/guides/${g.slug}`} className="text-xs text-ink bg-accent font-semibold px-3 py-1 rounded hover:opacity-90">
                  Modifier
                </Link>

                <form action={deleteGuide.bind(null, g.slug)}>
                  <ConfirmSubmitButton message={`Supprimer définitivement le guide "${g.title_en}" ?`} className="text-xs text-dim hover:text-rose-400 px-2 py-1">
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}

        {filteredGuides.length === 0 && (
          <div className="bg-panel border border-line rounded-xl p-8 text-center text-dim text-sm">
            Aucun guide ne correspond aux filtres ou à la recherche.
          </div>
        )}
      </div>
    </div>
  );
}
