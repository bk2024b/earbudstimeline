'use client';

export default function JourneyProgress({ chapters, activeIndex, onSelect, locale = 'fr' }) {
  const fr = locale !== 'en';
  return (
    <div className="journey-progress" aria-label={fr ? 'Progression du parcours' : 'Journey progress'}>
      <div className="journey-progress-label">{fr ? 'CHAPITRE' : 'CHAPTER'} {String(activeIndex + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</div>
      <div className="journey-progress-line">
        <div className="journey-progress-fill" style={{ width: `${chapters.length > 1 ? (activeIndex / (chapters.length - 1)) * 100 : 100}%` }} />
      </div>
      <div className="journey-progress-points">
        {chapters.map((chapter, index) => (
          <button key={chapter.id} className={index === activeIndex ? 'active' : ''} onClick={() => onSelect(index)} aria-label={`${chapter.name} — ${chapter.year}`} aria-current={index === activeIndex ? 'step' : undefined}>
            <span />
            <small>{chapter.year}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
