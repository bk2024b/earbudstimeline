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
          le champ complet n'apparaît que dans la modale au clic/raccourci. */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-9 h-9 bg-panel2/80 hover:bg-panel2 border border-line hover:border-accent/40 rounded-full text-dim hover:text-accent transition-all"
        aria-label={t('ariaLabel')}
      >
        <Search className="w-4 h-4" />
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
                className="flex-1 bg-transparent text-sm sm:text-base text-fg placeholder:text-dim outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
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
              {q.trim() && !isLoading && results.length === 0 && (
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
                        <BrandBadge brand={{ id: m.brand_id, name: m.brand_name, color: m.brand_color, image_url: m.brand_image_url }} size={24} />
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
                          {m.brand_name} • {m.gamme} • {m.release_date?.slice(0, 4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {m.price && (
                        <span className="font-display text-sm font-bold text-fg">
                          {m.price} $
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

export default memo(GlobalSearchModal);
