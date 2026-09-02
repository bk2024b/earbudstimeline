'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import JourneyHeader from './JourneyHeader';
import JourneyProgress from './JourneyProgress';
import JourneyStory from './JourneyStory';
import JourneyProduct from './JourneyProduct';
import JourneyNavigation from './JourneyNavigation';

export default function ExploreJourney({ journey, chapterIndex, onChapterChange, onComplete, onBack, locale = 'fr' }) {
  const [changing, setChanging] = useState(false);
  const touchStartX = useRef(null);
  const fr = locale !== 'en';
  const chapters = journey?.chapters || [];
  const chapter = chapters[chapterIndex];
  const previous = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;

  const story = useMemo(() => ({ chapter, previous }), [chapter, previous]);

  const goTo = (nextIndex) => {
    const clamped = Math.max(0, Math.min(chapters.length - 1, nextIndex));
    if (clamped === chapterIndex) return;
    setChanging(true);
    window.setTimeout(() => {
      onChapterChange(clamped);
      setChanging(false);
    }, 220);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        goTo(chapterIndex + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goTo(chapterIndex - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chapterIndex, chapters.length]);

  if (!chapter) return null;

  return (
    <section
      className="explore-journey-screen"
      aria-label={`${journey.name} ${fr ? 'parcours historique' : 'historical journey'}`}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) goTo(chapterIndex + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <JourneyHeader journey={journey} onBack={onBack} locale={locale} />
      <JourneyProgress chapters={chapters} activeIndex={chapterIndex} onSelect={goTo} locale={locale} />

      <div className={`journey-layout${changing ? ' is-changing' : ''}`}>
        <JourneyStory chapter={story.chapter} previous={story.previous} locale={locale} isCurated={journey.isCurated} />
        <JourneyProduct chapter={story.chapter} locale={locale} />
      </div>

      <JourneyNavigation
        chapterIndex={chapterIndex}
        chapterCount={chapters.length}
        onPrevious={() => goTo(chapterIndex - 1)}
        onNext={() => goTo(chapterIndex + 1)}
        onComplete={onComplete}
        locale={locale}
      />
    </section>
  );
}
