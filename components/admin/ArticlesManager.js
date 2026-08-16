'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ConfirmSubmitButton from './ConfirmSubmitButton';
import { deleteArticle, toggleArticleStatus } from '@/app/admin/(dashboard)/articles/actions';

export default function ArticlesManager({ articles = [] }) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'published', 'draft', 'missing-en', 'fr', 'en'

  const byId = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);

  const hasTranslation = (a) =>
    a.locale === 'en' ? Boolean(a.translation_of) : articles.some((x) => x.translation_of === a.id);

  const missingEnArticles = useMemo(
    () => articles.filter((a) => a.locale === 'fr' && !hasTranslation(a)),
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return articles.filter((a) => {
      // Filtres d'onglets
      if (filterTab === 'published' && a.status !== 'published') return false;
      if (filterTab === 'draft' && a.status !== 'draft') return false;
      if (filterTab === 'missing-en' && (a.locale !== 'fr' || hasTranslation(a))) return false;
      if (filterTab === 'fr' && a.locale !== 'fr') return false;
      if (filterTab === 'en' && a.locale !== 'en') return false;

      // Recherche
      if (q) {
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchId = a.id?.toLowerCase().includes(q);
        const matchExcerpt = a.excerpt?.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchExcerpt) return false;
      }

      return true;
    });
  }, [articles, search, filterTab]);

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de recherche & Filtres */}
      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-3">
        <div className="relative">
          <input
            type="search"
            placeholder="Rechercher un article par titre, identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-dim outline-none focus:border-accent"
          />
          <span className="absolute left-3 top-2.5 text-xs text-dim">🔍</span>
        </div>

        {/* Onglets de filtrage */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-line/50">
          <span className="text-dim text-[11px]">Filtrer :</span>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterTab === 'all'
                ? 'bg-accent/15 border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            Tous ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('published')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterTab === 'published'
                ? 'bg-emerald-400/15 border-emerald-400 text-emerald-400 font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            Publiés ({articles.filter((a) => a.status === 'published').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('draft')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterTab === 'draft'
                ? 'bg-amber/15 border-amber text-amber font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            Brouillons ({articles.filter((a) => a.status === 'draft').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('missing-en')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterTab === 'missing-en'
                ? 'bg-purple-400/15 border-purple-400 text-purple-300 font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            🌐 À traduire en anglais ({missingEnArticles.length})
          </button>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex flex-col gap-2.5">
        {filteredArticles.map((a) => {
          const isPublished = a.status === 'published';
          const sibling =
            a.locale === 'en' && a.translation_of ? byId.get(a.translation_of) : null;

          return (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 bg-panel border border-line rounded-xl p-3 sm:p-4 hover:border-line/80 transition-colors flex-wrap"
            >
              {/* Miniature + Infos */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Vignette couverture */}
                <div className="w-14 h-10 rounded-md border border-line bg-panel2 flex-none flex items-center justify-center overflow-hidden">
                  {a.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm opacity-40">📰</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm truncate">{a.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-panel2 text-dim border border-line">
                      {a.locale}
                    </span>

                    {/* Bouton rapide de bascule de statut */}
                    <form action={toggleArticleStatus.bind(null, a.id, a.status)} className="inline">
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
                    <span>{a.reading_minutes} min</span>
                    <span>·</span>
                    <span className="font-mono text-[11px]">{a.id}</span>
                    {sibling && (
                      <>
                        <span>·</span>
                        <span className="text-dim">↳ trad. de « {sibling.title} »</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {isPublished && (
                  <a
                    href={`/${a.locale}/blog/${a.id}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Voir l'article publié"
                    className="text-xs text-dim hover:text-white px-2 py-1 rounded bg-panel2 border border-line/60 flex items-center gap-1"
                  >
                    <span>↗</span>
                    <span className="hidden sm:inline">Voir</span>
                  </a>
                )}

                {a.locale === 'fr' && !hasTranslation(a) && (
                  <Link
                    href={`/admin/articles/new?translationOf=${a.id}`}
                    className="text-xs text-accent hover:underline px-2 py-1 rounded bg-accent/10 border border-accent/30 flex items-center gap-1"
                  >
                    <span>🌐</span>
                    <span>Traduire</span>
                  </Link>
                )}

                <Link
                  href={`/admin/articles/${a.id}`}
                  className="text-xs text-ink bg-accent font-semibold px-3 py-1 rounded hover:opacity-90"
                >
                  Modifier
                </Link>

                <form action={deleteArticle.bind(null, a.id)}>
                  <ConfirmSubmitButton
                    message={`Supprimer définitivement l'article "${a.title}" ?`}
                    className="text-xs text-dim hover:text-rose-400 px-2 py-1"
                  >
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="bg-panel border border-line rounded-xl p-8 text-center text-dim text-sm">
            Aucun article ne correspond aux filtres ou à la recherche.
          </div>
        )}
      </div>
    </div>
  );
}
