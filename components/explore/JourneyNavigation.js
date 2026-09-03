'use client';

export default function JourneyNavigation({ chapterIndex, chapterCount, onPrevious, onNext, onComplete, locale = 'fr' }) {
  const fr = locale !== 'en';
  const last = chapterIndex >= chapterCount - 1;
  return (
    <div className="journey-navigation">
      <button className="journey-nav-secondary" onClick={onPrevious} disabled={chapterIndex === 0}>← {fr ? 'Précédent' : 'Previous'}</button>
      {last ? (
        <button className="explore-primary-cta" onClick={onComplete}>{fr ? 'Terminer le parcours' : 'Complete journey'} <span>→</span></button>
      ) : (
        <button className="explore-primary-cta" onClick={onNext}>{fr ? 'Suivant' : 'Next'} <span>→</span></button>
      )}
    </div>
  );
}
