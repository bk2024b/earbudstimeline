'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import BrandBadge from './BrandBadge';

// Débounce court : évite une requête réseau à chaque frappe tout en restant
// perçu comme instantané. La route /api/search lit un cache serveur
// (unstable_cache, voir lib/queries.js) donc chaque requête est bon marché,
// mais pas besoin d'en envoyer une par lettre tapée non plus.
const DEBOUNCE_MS = 150;

function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const router = useRouter();
  const t = useTranslations('searchBar');

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
      setResults([]);
    }
  }, [isOpen]);

  // Recherche server-side (voir app/api/search/route.js) au lieu d'un filtre
  // client-side sur un catalogue complet passé en props — la modale n'existe
  // que si l'utilisateur l'ouvre, elle ne doit rien coûter aux autres.
  useEffect(() => {
    const term = q.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!term) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        // Ignore les réponses de requêtes obsolètes (l'utilisateur a retapé
        // entre-temps) pour ne pas afficher des résultats périmés.
        if (requestId === requestIdRef.current) {
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch {
        if (requestId === requestIdRef.current) setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [q]);

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
      {/* Bouton déclencheur dans le Header — icône seule (desktop + mobile),
          le champ complet n'apparaît que dans l'overlay au clic/raccourci. */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-9 h-9 bg-panel2/80 hover:bg-panel2 border border-line hover:border-accent/40 rounded-full text-dim hover:text-accent transition-all"
        aria-label={t('ariaLabel')}
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Overlay plein écran par-dessus la page actuelle (reste sur l'URL
          courante, se ferme au clic/Esc — pas de navigation vers une page
          séparée, voir décision produit). */}
      {/* Overlay modal palette — z-[100], fond 100% opaque sur la boîte de recherche */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex justify-center items-start pt-12 sm:pt-20 px-4 overflow-y-auto animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#111111] border border-line shadow-[0_25px_60px_rgba(0,0,0,0.9)] w-full max-w-2xl rounded-base p-5 sm:p-6 mb-12 relative text-fg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre de recherche dans le panneau flottant */}
            <div className="flex items-center gap-3 border-b border-line/80 pb-3.5 mb-4">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-accent shrink-0 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-accent shrink-0" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent text-base sm:text-lg font-display text-fg placeholder:text-dim outline-none focus-visible:ring-0"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="text-dim hover:text-fg p-1 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 text-dim hover:text-fg text-xs font-mono px-2 py-1 rounded-base bg-[#181818] border border-line transition-colors shrink-0"
              >
                <span>ESC</span>
              </button>
            </div>

            {/* Résultats ou suggestions */}
            {q.trim() && !isLoading && results.length === 0 && (
              <div className="text-dim text-xs sm:text-sm py-8 text-center font-mono bg-[#151515] rounded-base border border-line/40 my-2">
                Aucun écouteur trouvé pour « {q} ».
              </div>
            )}

            {!q.trim() && (
              <div className="py-3">
                <div className="text-dim text-xs mb-3 font-mono">
                  Recherches populaires :
                </div>
                <div className="flex flex-wrap gap-2">
                  {['AirPods Pro 2', 'WF-1000XM5', 'QuietComfort Ultra', 'Galaxy Buds3 Pro', 'Ear (a)'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQ(term)}
                      className="px-3 py-1.5 rounded-base text-xs font-mono bg-[#181818] border border-line hover:border-accent hover:text-accent text-dim transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-3">
                <div className="path-indicator text-accent text-[11px] mb-2.5">
                  Résultats ({results.length})
                </div>
                <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
                  {results.map((m, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between gap-3 p-3.5 cursor-pointer rounded-base border transition-colors ${
                          isSelected
                            ? 'bg-[#1e1e1e] border-accent text-fg'
                            : 'bg-[#151515] border-line/50 hover:bg-[#1a1a1a] hover:border-line text-dim'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0">
                            <BrandBadge brand={{ id: m.brand_id, name: m.brand_name, color: m.brand_color, image_url: m.brand_image_url }} size={28} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-fg truncate flex items-center gap-2">
                              <span>{m.name}</span>
                              {m.anc && (
                                <span className="text-[10px] bg-accent/10 border border-accent/30 text-accent px-1.5 py-0.2 rounded-base font-mono shrink-0">
                                  ANC
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-dim truncate font-mono mt-0.5">
                              {m.brand_name} · {m.gamme} · {m.release_date?.slice(0, 4)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {m.price && <span className="font-mono text-xs font-semibold text-fg">{m.price} $</span>}
                          <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-accent translate-x-0.5' : 'text-dim/40'} transition-transform`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-line/70 text-[11px] text-dim flex items-center justify-between font-mono">
              <span>↑↓ pour naviguer</span>
              <span>Entrée pour ouvrir</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(GlobalSearchModal);
