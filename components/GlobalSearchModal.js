'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, Volume2, ArrowRight } from 'lucide-react';
import BrandBadge from './BrandBadge';

export default function GlobalSearchModal({ models = [], brands = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const t = useTranslations('searchBar');

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands]);

  // Écouteur de raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus automatique sur le champ quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQ('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return models
      .filter((m) => {
        const b = brandMap[m.brand_id]?.name || m.brand_id;
        return `${m.name} ${b} ${m.gamme}`.toLowerCase().includes(term);
      })
      .slice(0, 8);
  }, [q, models, brandMap]);

  function handleSelect(model) {
    setIsOpen(false);
    router.push(`/ecouteurs/${model.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  }

  return (
    <>
      {/* Bouton déclencheur dans le Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-panel2/80 hover:bg-panel2 border border-line hover:border-accent/40 rounded-full px-3 py-1.5 text-xs text-dim hover:text-fg transition-all group"
        aria-label={t('ariaLabel')}
      >
        <Search className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
        <span className="hidden md:inline">{t('placeholder')}</span>
        <kbd className="hidden sm:inline-block font-mono text-[10px] bg-panel border border-line px-1.5 py-0.5 rounded text-dim/70">
          ⌘K
        </kbd>
      </button>

      {/* Modale plein écran */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          {/* Overlay clic pour fermer */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div
            className="relative w-full max-w-xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Champ de recherche */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-panel2/50">
              <Search className="w-5 h-5 text-accent shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent text-sm sm:text-base text-fg placeholder:text-dim outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="text-dim hover:text-fg p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="font-mono text-[10px] bg-panel border border-line px-2 py-0.5 rounded text-dim shrink-0">
                ESC
              </kbd>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-line/40">
              {q.trim() && results.length === 0 && (
                <div className="p-8 text-center text-dim text-sm">
                  Aucun écouteur trouvé pour &laquo; {q} &raquo;.
                </div>
              )}

              {!q.trim() && (
                <div className="p-6 text-center text-xs text-dim">
                  Tapez le nom d&apos;un modèle (ex: <i>AirPods Pro, WF-1000XM5, Galaxy Buds</i>) ou d&apos;une marque...
                </div>
              )}

              {results.map((m, idx) => {
                const brand = brandMap[m.brand_id];
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelect(m)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-3.5 sm:px-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent/15 text-fg' : 'hover:bg-panel2 text-dim'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <BrandBadge brand={brand || { id: m.brand_id, name: m.brand_id, color: '#6C8CFF' }} size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-fg truncate flex items-center gap-2">
                          <span>{m.name}</span>
                          {m.anc && (
                            <span className="text-[10px] bg-panel border border-line text-emerald-400 px-1.5 py-0.2 rounded font-normal shrink-0">
                              ANC
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-dim truncate">
                          {brand?.name} • {m.gamme} • {m.release_date?.slice(0, 4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {m.price && (
                        <span className="font-display text-sm font-bold text-fg">
                          {m.price} €
                        </span>
                      )}
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-dim/40'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pied de la modale */}
            <div className="p-2.5 bg-panel2 border-t border-line text-[11px] text-dim flex items-center justify-between px-4">
              <span>↑↓ pour naviguer</span>
              <span>Entrée pour ouvrir</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
