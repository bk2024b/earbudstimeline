'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import EvolutionChart from './EvolutionChart';

// Enveloppe EvolutionChart avec un filtre marque → gamme. Le filtrage lui-même
// ne demande aucune nouvelle logique de calcul (computeYearlySeries prend déjà
// n'importe quel tableau de modèles) : on filtre juste `models` ici avant de
// le transmettre, et EvolutionChart recalcule sa série normalement.
export default function EvolutionExplorer({ models, brands }) {
  const t = useTranslations('evolution');
  const [brandId, setBrandId] = useState('all');
  const [gamme, setGamme] = useState('all');

  const gammes = useMemo(() => {
    if (brandId === 'all') return [];
    return [...new Set(models.filter((m) => m.brand_id === brandId).map((m) => m.gamme))].sort();
  }, [models, brandId]);

  const filtered = useMemo(() => {
    let result = models;
    if (brandId !== 'all') result = result.filter((m) => m.brand_id === brandId);
    if (gamme !== 'all') result = result.filter((m) => m.gamme === gamme);
    return result;
  }, [models, brandId, gamme]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            setGamme('all');
          }}
          className="bg-panel2 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <option value="all">{t('allBrands')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {gammes.length > 0 && (
          <select
            value={gamme}
            onChange={(e) => setGamme(e.target.value)}
            className="bg-panel2 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <option value="all">{t('allGammes')}</option>
            {gammes.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      <EvolutionChart models={filtered} />
    </div>
  );
}
