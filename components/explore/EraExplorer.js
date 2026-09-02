'use client';

import { useMemo, useState } from 'react';
import { getBrandStateAtYear } from '@/lib/brandJourney';

export default function EraExplorer({ journeys, periodBounds, onBack, onOpenJourney, locale = 'fr' }) {
  const fr = locale !== 'en';
  const [year, setYear] = useState(periodBounds.max);
  const brands = useMemo(() => getBrandStateAtYear(journeys, year), [journeys, year]);

  return (
    <section className="era-explorer-screen">
      <button className="tools-back" onClick={onBack}>← {fr ? 'Outils' : 'Tools'}</button>
      <div className="era-explorer-head">
        <div className="universe-kicker">{fr ? 'ÉPOQUE' : 'ERA'}</div>
        <div className="era-big-year">{year}</div>
        <input type="range" min={periodBounds.min} max={periodBounds.max} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label={fr ? 'Année' : 'Year'} />
      </div>
      <div className="era-grid era-grid-new">
        {brands.map((brand) => (
          <button key={brand.id} className="era-cell era-cell-button" onClick={() => brand.current && onOpenJourney(journeys.indexOf(brand))} disabled={!brand.current}>
            <span className="ec-brand" style={{ color: brand.color }}>{brand.name}</span>
            {brand.current ? <strong className="ec-model">{brand.current.name}</strong> : <span className="ec-empty">{fr ? 'Pas encore de modèle' : 'No model yet'}</span>}
            {brand.current && <small>{brand.current.year}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}
