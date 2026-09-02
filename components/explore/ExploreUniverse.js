'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Explore3DCanvas from './Explore3DCanvas';

export default function ExploreUniverse({ journeys, activeBrandIndex, onBrandChange, onExploreJourney, onExit, locale = 'fr' }) {
  const fr = locale !== 'en';
  const journey = journeys[activeBrandIndex] || journeys[0];
  const index = journeys.indexOf(journey);

  return (
    <section className="explore-universe-screen" aria-label={fr ? 'Univers des marques' : 'Brand universe'}>
      <div className="universe-context">
        <button className="universe-back" onClick={onExit}>← {fr ? 'EarbudsTimeline' : 'EarbudsTimeline'}</button>
        <div className="universe-count">{String(index + 1).padStart(2, '0')} / {String(journeys.length).padStart(2, '0')} {fr ? 'MARQUES' : 'BRANDS'}</div>
      </div>

      <div className="universe-copy">
        <div className="universe-kicker">{fr ? 'UNIVERS DES MARQUES' : 'BRAND UNIVERSE'}</div>
        <div className="universe-index">{String(index + 1).padStart(2, '0')}</div>
        <h1>{journey?.name}</h1>
        <p>{journey?.periodStart} — {journey?.periodEnd} · {journey?.totalCount} {fr ? 'modèles suivis' : 'tracked models'}</p>
        <button className="explore-primary-cta universe-journey-cta" onClick={() => onExploreJourney(index)}>
          {fr ? 'Explorer le parcours' : 'Explore the journey'} <span>→</span>
        </button>
      </div>

      <Explore3DCanvas
        journeys={journeys}
        activeIndex={activeBrandIndex}
        onActiveIndexChange={onBrandChange}
        onOpenHistory={onExploreJourney}
        locale={locale}
      />

      <div className="universe-navigation" aria-label={fr ? 'Navigation des marques' : 'Brand navigation'}>
        <button className="nav-circle" onClick={() => onBrandChange(activeBrandIndex - 1)} aria-label={fr ? 'Marque précédente' : 'Previous brand'}><ChevronLeft size={16} /></button>
        <div className="universe-dots">
          {journeys.map((item, i) => (
            <button key={item.id} className={i === activeBrandIndex ? 'active' : ''} onClick={() => onBrandChange(i)} aria-label={item.name} aria-current={i === activeBrandIndex ? 'true' : undefined} />
          ))}
        </div>
        <button className="nav-circle" onClick={() => onBrandChange(activeBrandIndex + 1)} aria-label={fr ? 'Marque suivante' : 'Next brand'}><ChevronRight size={16} /></button>
      </div>

      <div className="universe-hint">{fr ? 'Glisser pour parcourir · Cliquer deux fois pour entrer' : 'Drag to explore · Click twice to enter'}</div>
    </section>
  );
}
