'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ExploreIntro from './ExploreIntro';
import ExploreUniverse from './ExploreUniverse';
import ExploreJourney from './ExploreJourney';
import JourneyComplete from './JourneyComplete';
import ExploreTools from './ExploreTools';
import EraExplorer from './EraExplorer';
import EvolutionCompare from './EvolutionCompare';
import './explore.css';

export default function ExploreExperience({ journeys = [], locale = 'fr', onExit }) {
  const fr = locale !== 'en';
  const [experience, setExperience] = useState('intro');
  const [brandIndex, setBrandIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [completedBrands, setCompletedBrands] = useState([]);
  const [introReady, setIntroReady] = useState(false);

  const currentJourney = journeys[brandIndex] || journeys[0] || null;
  const periodBounds = useMemo(() => {
    if (!journeys.length) return { min: 2016, max: new Date().getFullYear() };
    return { min: Math.min(...journeys.map((journey) => journey.periodStart)), max: Math.max(...journeys.map((journey) => journey.periodEnd)) };
  }, [journeys]);

  useEffect(() => {
    try { setIntroReady(window.localStorage.getItem('explore-intro-seen') === '1'); }
    catch { setIntroReady(false); }
  }, []);
  useEffect(() => { if (introReady) setExperience('universe'); }, [introReady]);

  const beginExplore = useCallback(() => {
    try { window.localStorage.setItem('explore-intro-seen', '1'); } catch {}
    setIntroReady(true);
    setExperience('universe');
  }, []);

  const goToBrand = useCallback((index) => {
    if (!journeys.length) return;
    setBrandIndex(((index % journeys.length) + journeys.length) % journeys.length);
  }, [journeys.length]);

  // Stable callback: changing the active brand must not recreate the WebGL scene.
  const openJourney = useCallback((index) => {
    if (typeof index === 'number') setBrandIndex(index);
    setChapterIndex(0);
    setExperience('journey');
  }, []);

  const completeJourney = useCallback(() => {
    if (!currentJourney) return;
    setCompletedBrands((items) => items.includes(currentJourney.id) ? items : [...items, currentJourney.id]);
    setExperience('complete');
  }, [currentJourney]);

  const exploreAnother = useCallback(() => {
    if (!journeys.length) return;
    setBrandIndex((index) => (index + 1) % journeys.length);
    setChapterIndex(0);
    setExperience('universe');
  }, [journeys.length]);

  const goBackToUniverse = useCallback(() => setExperience('universe'), []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (experience === 'universe') onExit?.();
        else setExperience('universe');
        return;
      }
      if (experience === 'universe') {
        if (event.key === 'ArrowRight') goToBrand(brandIndex + 1);
        if (event.key === 'ArrowLeft') goToBrand(brandIndex - 1);
        if (event.key === 'Enter') openJourney(brandIndex);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [experience, brandIndex, goToBrand, openJourney, onExit]);

  if (!journeys.length) return <div className="explore"><div className="explore-stars" /><div className="explore-empty">{fr ? 'Aucune donnée disponible pour le moment.' : 'No data available yet.'}</div></div>;

  const showTopbar = experience !== 'intro';

  return (
    <div className="explore" role="application" aria-label={fr ? "Explorer l'histoire des écouteurs" : 'Explore earbuds history'}>
      <div className="explore-stars" />
      <div className="explore-ambient-glow" style={{ background: `radial-gradient(circle at 50% 45%, ${currentJourney?.color || '#22D07A'}18 0%, transparent 65%)` }} />
      {showTopbar && (
        <div className="explore-topbar">
          <button className="explore-logo" onClick={() => setExperience('universe')}>Earbuds<b>Timeline</b></button>
          <div className="explore-topbar-right">
            {experience === 'universe' && <button className="explore-tools-trigger" onClick={() => setExperience('tools')}>{fr ? 'Outils' : 'Tools'}</button>}
            <button className="explore-exit" onClick={onExit}>{fr ? 'Quitter' : 'Exit'}</button>
          </div>
        </div>
      )}
      <div className="explore-progress-pill">{completedBrands.length > 0 ? `${completedBrands.length} ${fr ? 'parcours' : 'journeys'}` : 'Explore'}</div>

      {experience === 'intro' && <ExploreIntro locale={locale} onBegin={beginExplore} onSkip={beginExplore} />}
      {experience === 'universe' && <ExploreUniverse journeys={journeys} activeBrandIndex={brandIndex} onBrandChange={goToBrand} onExploreJourney={openJourney} onExit={onExit} locale={locale} />}
      {experience === 'journey' && currentJourney && <ExploreJourney journey={currentJourney} chapterIndex={chapterIndex} onChapterChange={setChapterIndex} onComplete={completeJourney} onBack={goBackToUniverse} locale={locale} />}
      {experience === 'complete' && currentJourney && <JourneyComplete journey={currentJourney} onExploreAnother={exploreAnother} onViewProducts={onExit} onCompare={() => setExperience('compare')} locale={locale} />}
      {experience === 'tools' && <ExploreTools onEra={() => setExperience('era')} onCompare={() => setExperience('compare')} onBack={goBackToUniverse} locale={locale} />}
      {experience === 'era' && <EraExplorer journeys={journeys} periodBounds={periodBounds} onBack={() => setExperience('tools')} onOpenJourney={openJourney} locale={locale} />}
      {experience === 'compare' && currentJourney && <EvolutionCompare journey={currentJourney} onBack={() => setExperience('tools')} locale={locale} />}
    </div>
  );
}
