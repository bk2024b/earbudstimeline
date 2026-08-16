'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeftRight, Search, X, Check } from 'lucide-react';
import BrandBadge from './BrandBadge';

export default function CompareSelectors({ brands = [], models = [], a, b }) {
  const t = useTranslations('comparer');
  const router = useRouter();

  const brandMap = useMemo(() => Object.fromEntries(brands.map((br) => [br.id, br])), [brands]);
  const modelA = useMemo(() => models.find((m) => m.id === a), [models, a]);
  const modelB = useMemo(() => models.find((m) => m.id === b), [models, b]);

  function navigate(newA, newB) {
    const params = new URLSearchParams();
    if (newA) params.set('a', newA);
    if (newB) params.set('b', newB);
    router.push(`/comparer?${params.toString()}`);
  }

  function handleSwap() {
    navigate(b, a);
  }

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-8">
      {/* Colonne A */}
      <ModelAutocompleteInput
        placeholder={t('optionA') || 'Choisir le premier modèle...'}
        selectedModel={modelA}
        brands={brands}
        brandMap={brandMap}
        models={models}
        onSelect={(selected) => navigate(selected?.id || '', b)}
        label="Modèle A"
      />

      {/* Bouton Inverser */}
      <div className="flex justify-center sm:self-center py-1">
        <button
          type="button"
          onClick={handleSwap}
          disabled={!a && !b}
          title="Inverser les deux modèles"
          className="w-10 h-10 rounded-full bg-panel2 border border-line hover:border-accent text-dim hover:text-white flex items-center justify-center transition-all disabled:opacity-40"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Colonne B */}
      <ModelAutocompleteInput
        placeholder={t('optionB') || 'Choisir le second modèle...'}
        selectedModel={modelB}
        brands={brands}
        brandMap={brandMap}
        models={models}
        onSelect={(selected) => navigate(a, selected?.id || '')}
        label="Modèle B"
      />
    </div>
  );
}

function ModelAutocompleteInput({ placeholder, selectedModel, brandMap, models, onSelect, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  // Fermeture si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return models.slice(0, 10);
    return models
      .filter((m) => {
        const b = brandMap[m.brand_id]?.name || m.brand_id;
        return `${m.name} ${b} ${m.gamme}`.toLowerCase().includes(term);
      })
      .slice(0, 10);
  }, [query, models, brandMap]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <span className="text-[11px] font-semibold text-dim uppercase tracking-wider block mb-1.5">{label}</span>

      {selectedModel ? (
        <div className="flex items-center justify-between bg-panel2 border border-line hover:border-accent/60 rounded-xl p-3 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandBadge
              brand={brandMap[selectedModel.brand_id] || { id: selectedModel.brand_id, name: selectedModel.brand_id, color: '#6C8CFF' }}
              size={22}
            />
            <div className="min-w-0">
              <span className="font-semibold text-sm text-white block truncate">{selectedModel.name}</span>
              <span className="text-xs text-dim block">
                {brandMap[selectedModel.brand_id]?.name} • {selectedModel.release_date?.slice(0, 4)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="p-1 text-dim hover:text-white rounded-lg hover:bg-panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center bg-panel2 border border-line focus-within:border-accent rounded-xl px-3.5 py-2.5 transition-colors">
            <Search className="w-4 h-4 text-dim mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-white placeholder:text-dim outline-none"
            />
          </div>

          {/* Menu déroulant de suggestions */}
          {isOpen && (
            <div className="absolute top-full mt-1.5 left-0 right-0 max-h-64 overflow-y-auto bg-panel border border-line rounded-xl shadow-2xl z-30 divide-y divide-line/40">
              {filtered.length === 0 ? (
                <div className="p-4 text-xs text-dim text-center">Aucun modèle correspondant</div>
              ) : (
                filtered.map((m) => {
                  const b = brandMap[m.brand_id];
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        onSelect(m);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="p-3 hover:bg-panel2 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BrandBadge brand={b || { id: m.brand_id, name: m.brand_id, color: '#6C8CFF' }} size={20} />
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate text-sm">{m.name}</span>
                          <span className="text-dim text-[11px] block">{b?.name} • {m.gamme}</span>
                        </div>
                      </div>
                      <span className="font-mono text-dim shrink-0">{m.release_date?.slice(0, 4)}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
