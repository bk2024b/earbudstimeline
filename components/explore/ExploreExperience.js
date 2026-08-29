'use client';

import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { generateStory, getBrandStateAtYear, buildCompareData } from '@/lib/brandJourney';
import './explore.css';

const MODES = [
  { id: 'universe', label: 'Univers' },
  { id: 'history', label: 'Histoire' },
  { id: 'era', label: 'Époque' },
  { id: 'galaxy', label: 'Galaxie' },
  { id: 'compare', label: 'Comparer' },
];

const SLIDE_DURATION_MS = 5200;

// -----------------------------------------------------------------------
// Small presentational bits
// -----------------------------------------------------------------------

function ProductVisual({ chapter, changing }) {
  return (
    <div className={`product-frame${changing ? ' changing' : ''}`}>
      {chapter?.image_url ? (
        // Real product photo when the DB has one (earbuds.image_url).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={chapter.image_url} alt={chapter.name} />
      ) : (
        <svg className="fallback-glyph" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="6" y="4" width="24" height="46" rx="12" fill={chapter?.brandColor || '#9A9AA3'} opacity=".9" />
          <rect x="34" y="4" width="24" height="46" rx="12" fill={chapter?.brandColor || '#9A9AA3'} opacity=".55" />
          <rect x="12" y="50" width="12" height="24" rx="6" fill="#3a3f3c" />
          <rect x="40" y="50" width="12" height="24" rx="6" fill="#3a3f3c" />
        </svg>
      )}
    </div>
  );
}

function SpecGrid({ chapter, locale }) {
  const fr = locale !== 'en';
  return (
    <div className="spec-grid">
      <div className="spec-cell">
        <div className="sc-label">{fr ? 'Prix lancement' : 'Launch price'}</div>
        <div className="sc-value">{chapter.price ? `${chapter.price} $` : '—'}</div>
      </div>
      <div className="spec-cell">
        <div className="sc-label">ANC</div>
        <div className="sc-value">{chapter.anc ? (fr ? 'Oui' : 'Yes') : (fr ? 'Non' : 'No')}</div>
      </div>
      <div className="spec-cell">
        <div className="sc-label">{fr ? 'Autonomie totale' : 'Total battery'}</div>
        <div className="sc-value">{chapter.battery_case_h != null ? `${chapter.battery_case_h} h` : '—'}</div>
      </div>
      <div className="spec-cell">
        <div className="sc-label">{fr ? 'Résistance' : 'Water rating'}</div>
        <div className="sc-value">{chapter.water_rating || '—'}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------

export default function ExploreExperience({ journeys, locale = 'fr', onExit }) {
  const fr = locale !== 'en';
  const reduceMotion = useRef(false);

  const [mode, setMode] = useState('universe');
  const [universeSubMode, setUniverseSubMode] = useState('rotational'); // 'rotational' | 'cover'
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [slidePct, setSlidePct] = useState(0);
  const [eraYear, setEraYear] = useState(null);
  const [dragging, setDragging] = useState(false);

  const ringRef = useRef(null);
  const galaxyRef = useRef(null);
  const [galaxyNodes, setGalaxyNodes] = useState([]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const currentJourney = journeys[activeBrandIndex] || journeys[0] || null;

  const periodBounds = useMemo(() => {
    if (!journeys.length) return { min: 2016, max: new Date().getFullYear() };
    return {
      min: Math.min(...journeys.map((j) => j.periodStart)),
      max: Math.max(...journeys.map((j) => j.periodEnd)),
    };
  }, [journeys]);

  useEffect(() => {
    if (eraYear === null) setEraYear(periodBounds.max);
  }, [periodBounds, eraYear]);

  // ---- Universe: rotate/select ----
  const goToBrand = useCallback((index) => {
    if (!journeys.length) return;
    const next = ((index % journeys.length) + journeys.length) % journeys.length;
    setActiveBrandIndex(next);
  }, [journeys.length]);

  useEffect(() => {
    if (mode !== 'universe' || !autoplay) return undefined;
    const id = setInterval(() => goToBrand(activeBrandIndex + 1), 3200);
    return () => clearInterval(id);
  }, [mode, autoplay, activeBrandIndex, goToBrand]);

  // pointer drag on the orbit ring
  const dragState = useRef({ startX: 0, startIndex: 0 });
  function handlePointerDown(e) {
    setDragging(true);
    dragState.current = { startX: e.clientX, startIndex: activeBrandIndex };
    ringRef.current?.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragging) return;
    const delta = e.clientX - dragState.current.startX;
    const step = Math.trunc(delta / 90);
    if (step !== 0) {
      goToBrand(dragState.current.startIndex - step);
    }
  }
  function handlePointerUp() { setDragging(false); }

  function handleWheel(e) {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 6) return;
    goToBrand(activeBrandIndex + (e.deltaY > 0 ? 1 : -1));
  }

  // ---- History: chapter navigation ----
  function openHistory(brandIndex) {
    if (brandIndex !== undefined) setActiveBrandIndex(brandIndex);
    setActiveChapterIndex(0);
    setAutoplay(false);
    setSlidePct(0);
    setMode('history');
  }

  const showChapter = useCallback((index) => {
    if (!currentJourney) return;
    const clamped = Math.max(0, Math.min(currentJourney.chapters.length - 1, index));
    if (clamped === activeChapterIndex) return;
    setChanging(true);
    setSlidePct(0);
    setTimeout(() => {
      setActiveChapterIndex(clamped);
      setChanging(false);
    }, reduceMotion.current ? 0 : 260);
  }, [currentJourney, activeChapterIndex]);

  useEffect(() => { setActiveChapterIndex(0); }, [activeBrandIndex]);

  // history wheel/keys/touch
  const historyLock = useRef(false);
  function handleHistoryWheel(e) {
    if (historyLock.current) return;
    historyLock.current = true;
    showChapter(activeChapterIndex + (e.deltaY > 0 ? 1 : -1));
    setTimeout(() => { historyLock.current = false; }, reduceMotion.current ? 60 : 420);
  }

  const touchStartX = useRef(null);
  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) showChapter(activeChapterIndex + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  // slideshow autoplay for history chapters
  useEffect(() => {
    if (mode !== 'history' || !autoplay || !currentJourney) return undefined;
    const tick = 60;
    const id = setInterval(() => {
      setSlidePct((p) => {
        const next = p + (tick / SLIDE_DURATION_MS) * 100;
        if (next >= 100) {
          showChapter(activeChapterIndex + 1 >= currentJourney.chapters.length ? 0 : activeChapterIndex + 1);
          return 0;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(id);
  }, [mode, autoplay, activeChapterIndex, currentJourney, showChapter]);

  // global keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (mode === 'universe') {
        if (e.key === 'ArrowRight') goToBrand(activeBrandIndex + 1);
        else if (e.key === 'ArrowLeft') goToBrand(activeBrandIndex - 1);
        else if (e.key === 'Enter') openHistory();
      } else if (mode === 'history') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') showChapter(activeChapterIndex + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') showChapter(activeChapterIndex - 1);
      }
      if (e.key === 'Escape') {
        if (mode !== 'universe') setMode('universe');
        else onExit?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, activeBrandIndex, activeChapterIndex, goToBrand, showChapter, onExit]);

  // ---- Galaxy: golden-angle bubble layout, recomputed on resize ----
  useLayoutEffect(() => {
    if (mode !== 'galaxy' || !galaxyRef.current || !journeys.length) return undefined;

    function layout() {
      const rect = galaxyRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const maxCount = Math.max(...journeys.map((j) => j.totalCount));
      const spread = Math.min(rect.width, rect.height) * 0.42;

      const nodes = journeys.map((journey, i) => {
        const angle = i * 137.508 * (Math.PI / 180); // golden angle
        const r = spread * Math.sqrt((i + 0.5) / journeys.length);
        const size = 60 + (journey.totalCount / maxCount) * 100;
        return {
          journey,
          left: cx + r * Math.cos(angle),
          top: cy + r * Math.sin(angle),
          size,
        };
      });
      setGalaxyNodes(nodes);
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(galaxyRef.current);
    return () => ro.disconnect();
  }, [mode, journeys]);

  // ---- Era ----
  const eraBrands = useMemo(() => {
    if (eraYear === null) return [];
    return getBrandStateAtYear(journeys, eraYear);
  }, [journeys, eraYear]);

  // ---- Compare ----
  const compareData = useMemo(() => {
    if (!currentJourney || currentJourney.chapters.length < 2) return null;
    return buildCompareData(currentJourney);
  }, [currentJourney]);

  const [compareRevealed, setCompareRevealed] = useState(false);
  useEffect(() => {
    setCompareRevealed(false);
    if (mode === 'compare') {
      const t = setTimeout(() => setCompareRevealed(true), reduceMotion.current ? 0 : 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [mode, currentJourney]);

  if (!journeys.length) {
    return (
      <div className="explore">
        <div className="explore-stars" />
        <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9AA3' }}>
          {fr ? 'Aucune donnée disponible pour le moment.' : 'No data available yet.'}
        </p>
      </div>
    );
  }

  const chapters = currentJourney?.chapters || [];
  const activeChapter = chapters[activeChapterIndex];
  const prevChapter = activeChapterIndex > 0 ? chapters[activeChapterIndex - 1] : null;

  return (
    <div className="explore" role="application" aria-label={fr ? "Explorer l'histoire des écouteurs" : 'Explore earbuds history'}>
      <div className="explore-stars" />

      <div className="explore-topbar">
        <a className="explore-logo" href={`/${locale}`}>Earbuds<b>Timeline</b></a>
        <button className="explore-exit" onClick={onExit}>
          {fr ? 'Quitter' : 'Exit'}
        </button>
      </div>

      <nav className="mode-switcher" aria-label={fr ? "Modes d'exploration" : 'Exploration modes'}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-btn${mode === m.id ? ' active' : ''}`}
            onClick={() => setMode(m.id)}
            aria-current={mode === m.id ? 'true' : undefined}
          >
            {fr ? m.label : m.id.charAt(0).toUpperCase() + m.id.slice(1)}
          </button>
        ))}
      </nav>

      {/* ============ UNIVERSE ============ */}
      <section className={`explore-screen${mode === 'universe' ? ' active' : ''}`} aria-hidden={mode !== 'universe'}>
        <div className="universe-hero">
          <div className="universe-eyebrow">Earbuds Timeline · Explore</div>
          <h1>{fr ? 'Choisissez une marque' : 'Choose a brand'}</h1>
          <p>{fr ? 'Glissez, tournez la molette, ou utilisez les flèches.' : 'Drag, scroll, or use the arrow keys.'}</p>
        </div>

        <div className="carousel-stage">
          <div
            ref={ringRef}
            className={`orbit-ring${dragging ? ' dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            role="listbox"
            aria-label={fr ? 'Marques' : 'Brands'}
            tabIndex={0}
          >
            {journeys.map((journey, i) => {
              const count = journeys.length;
              let offset = i - activeBrandIndex;
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;

              const isRotational = universeSubMode === 'rotational';
              const angle = isRotational ? offset * (360 / count) : offset * 22;
              const radius = isRotational ? 380 : 320;
              const abs = Math.abs(offset);
              const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.68 : 0.55;
              const opacity = abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.28 : 0.1;
              const blur = abs === 0 ? 0 : abs === 1 ? 1 : 2;

              return (
                <div
                  key={journey.id}
                  className={`brand-card${offset === 0 ? ' active' : ''}`}
                  role="option"
                  aria-selected={offset === 0}
                  style={{
                    '--angle': `${angle}deg`,
                    '--radius': `${radius}px`,
                    '--scale': scale,
                    '--opacity': opacity,
                    '--blur': `${blur}px`,
                    '--z': 100 - abs,
                  }}
                  onClick={() => (offset === 0 ? openHistory(i) : goToBrand(i))}
                >
                  <div className="bc-swatch" style={{ background: `${journey.color}22`, border: `1px solid ${journey.color}55`, color: journey.color }}>
                    {journey.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="bc-name">{journey.name}</div>
                  <div className="bc-meta">
                    {journey.totalCount} {fr ? 'modèles' : 'models'} · {journey.periodStart}–{journey.periodEnd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="universe-controls">
          <button className="nav-circle" onClick={() => goToBrand(activeBrandIndex - 1)} aria-label={fr ? 'Précédent' : 'Previous'}>
            <ChevronLeft size={16} />
          </button>
          <button
            className="nav-circle"
            onClick={() => setUniverseSubMode((s) => (s === 'rotational' ? 'cover' : 'rotational'))}
            aria-label={fr ? 'Changer de vue' : 'Switch view'}
            title={universeSubMode === 'rotational' ? 'Rotational' : 'Cover flow'}
          >
            {universeSubMode === 'rotational' ? '◎' : '▭'}
          </button>
          <button className="open-journey-btn" onClick={() => openHistory()}>
            {fr ? "Voir l'histoire" : 'See the story'}
          </button>
          <button className="nav-circle" onClick={() => setAutoplay((a) => !a)} aria-label={fr ? 'Lecture auto' : 'Autoplay'}>
            {autoplay ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="nav-circle" onClick={() => goToBrand(activeBrandIndex + 1)} aria-label={fr ? 'Suivant' : 'Next'}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="universe-hint">
          {fr ? 'Glisser · Molette · Flèches · Entrée pour ouvrir' : 'Drag · Scroll · Arrows · Enter to open'}
        </div>
      </section>

      {/* ============ HISTORY ============ */}
      <section
        className={`explore-screen${mode === 'history' ? ' active' : ''}`}
        aria-hidden={mode !== 'history'}
        onWheel={mode === 'history' ? handleHistoryWheel : undefined}
        onTouchStart={mode === 'history' ? handleTouchStart : undefined}
        onTouchEnd={mode === 'history' ? handleTouchEnd : undefined}
      >
        <button className="history-back" onClick={() => setMode('universe')}>
          ← {fr ? 'Toutes les marques' : 'All brands'}
        </button>

        {activeChapter && (
          <>
            <div className="history-inner">
              <div className={`story-block${changing ? ' changing' : ''}`}>
                <div className="s-year">{activeChapter.year}</div>
                <h2 className="s-title">{activeChapter.name}</h2>
                <div className="s-gen">{activeChapter.gamme}</div>
                {activeChapter.tagline && <p className="s-tagline">{activeChapter.tagline}</p>}
                <p className="s-text">{generateStory(activeChapter, prevChapter)}</p>
                {activeChapter.editorial && <p className="s-editorial">{activeChapter.editorial}</p>}
                <span className="s-tag">
                  {fr ? 'Étape' : 'Step'} {activeChapterIndex + 1} / {chapters.length}
                  {currentJourney.isCurated ? ` · ${fr ? 'temps forts sélectionnés' : 'selected highlights'}` : ''}
                </span>
              </div>

              <div className="product-panel">
                <ProductVisual chapter={activeChapter} changing={changing} />
                <SpecGrid chapter={activeChapter} locale={locale} />
              </div>
            </div>

            <div className="history-rail">
              <div className="rail-line">
                <div className="rail-progress" style={{ width: `${chapters.length > 1 ? (activeChapterIndex / (chapters.length - 1)) * 100 : 100}%` }} />
              </div>
              <div className="rail-dots">
                {chapters.map((c, i) => (
                  <button key={c.id} className={`rail-dot${i === activeChapterIndex ? ' active' : ''}`} onClick={() => showChapter(i)}>
                    <span className="dot" />
                    <span>{c.year}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="slideshow-bar">
              <button className="slideshow-toggle" onClick={() => setAutoplay((a) => !a)}>
                {autoplay ? (fr ? 'Pause' : 'Pause') : (fr ? 'Lecture auto' : 'Autoplay')}
              </button>
              <div className="slideshow-progress-track">
                <div className="slideshow-progress-fill" style={{ width: `${autoplay ? slidePct : 0}%` }} />
              </div>
            </div>
          </>
        )}
      </section>

      {/* ============ ERA ============ */}
      <section className={`explore-screen${mode === 'era' ? ' active' : ''}`} aria-hidden={mode !== 'era'}>
        <div className="era-inner">
          <div className="era-year-display">{eraYear ?? periodBounds.max}</div>
          <div className="era-slider-wrap">
            <input
              type="range"
              className="era-slider"
              min={periodBounds.min}
              max={periodBounds.max}
              value={eraYear ?? periodBounds.max}
              onChange={(e) => setEraYear(Number(e.target.value))}
              aria-label={fr ? 'Année' : 'Year'}
            />
          </div>
          <div className="era-grid">
            {eraBrands.map((b) => (
              <div key={b.id} className="era-cell">
                <div className="ec-brand" style={{ color: b.color }}>{b.name}</div>
                {b.current ? (
                  <div className="ec-model">{b.current.name}</div>
                ) : (
                  <div className="ec-empty">{fr ? 'Pas encore de modèle' : 'No model yet'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALAXY ============ */}
      <section className={`explore-screen${mode === 'galaxy' ? ' active' : ''}`} aria-hidden={mode !== 'galaxy'}>
        <div className="galaxy-field" ref={galaxyRef}>
          {galaxyNodes.map((node) => (
            <button
              key={node.journey.id}
              className="galaxy-node"
              style={{
                left: node.left,
                top: node.top,
                width: node.size,
                height: node.size,
                background: `radial-gradient(circle at 35% 30%, ${node.journey.color}33, transparent 70%)`,
              }}
              onClick={() => openHistory(journeys.indexOf(node.journey))}
            >
              <span className="gn-name">{node.journey.name}</span>
              <span className="gn-count">{node.journey.totalCount}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============ COMPARE ============ */}
      <section className={`explore-screen${mode === 'compare' ? ' active' : ''}`} aria-hidden={mode !== 'compare'}>
        <div className="compare-inner">
          <div className="compare-title">
            {currentJourney?.name} — {fr ? 'premier vs dernier modèle suivi' : 'first vs latest tracked model'}
          </div>
          {compareData ? (
            <>
              <div className="compare-columns">
                <div className={`compare-side${compareRevealed ? ' show' : ''}`}>
                  <div className="cs-year">{compareData.first.year}</div>
                  <div className="cs-name">{compareData.first.name}</div>
                </div>
                <div className="compare-arrow">→</div>
                <div className={`compare-side${compareRevealed ? ' show' : ''}`} style={{ transitionDelay: '.1s' }}>
                  <div className="cs-year">{compareData.last.year}</div>
                  <div className="cs-name">{compareData.last.name}</div>
                </div>
              </div>
              <div className="compare-changes">
                {compareData.changes.length === 0 && (
                  <p className="compare-empty">{fr ? "Pas de changement majeur détecté sur les caractéristiques suivies." : 'No major change detected across tracked specs.'}</p>
                )}
                {compareData.changes.map((change, i) => (
                  <span key={change} className={`compare-change${compareRevealed ? ' show' : ''}`} style={{ transitionDelay: `${.2 + i * .06}s` }}>
                    {change}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="compare-empty">{fr ? "Cette marque n'a pas assez de modèles suivis pour une comparaison." : 'Not enough tracked models for this brand yet.'}</p>
          )}
        </div>
      </section>
    </div>
  );
}
