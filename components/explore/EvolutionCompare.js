'use client';

import { buildCompareData } from '@/lib/brandJourney';

export default function EvolutionCompare({ journey, onBack, locale = 'fr' }) {
  const fr = locale !== 'en';
  const data = journey?.chapterCount > 1 ? buildCompareData(journey) : null;
  return (
    <section className="evolution-compare-screen">
      <button className="tools-back" onClick={onBack}>← {fr ? 'Outils' : 'Tools'}</button>
      <div className="compare-inner compare-inner-new">
        <div className="universe-kicker">{fr ? 'COMPARER L’ÉVOLUTION' : 'COMPARE EVOLUTION'}</div>
        <h1>{journey?.name}</h1>
        {data ? (
          <>
            <div className="compare-columns">
              <div className="compare-side show"><div className="cs-year">{data.first.year}</div><div className="cs-name">{data.first.name}</div></div>
              <div className="compare-arrow">→</div>
              <div className="compare-side show"><div className="cs-year">{data.last.year}</div><div className="cs-name">{data.last.name}</div></div>
            </div>
            <div className="compare-changes">
              {data.changes.length ? data.changes.map((change) => <span className="compare-change show" key={change}>{change}</span>) : <p className="compare-empty">{fr ? 'Pas de changement majeur détecté sur les caractéristiques suivies.' : 'No major change detected across tracked specs.'}</p>}
            </div>
          </>
        ) : <p className="compare-empty">{fr ? "Cette marque n'a pas assez de modèles suivis pour une comparaison." : 'Not enough tracked models for this brand yet.'}</p>}
      </div>
    </section>
  );
}
