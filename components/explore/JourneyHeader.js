'use client';

export default function JourneyHeader({ journey, onBack, locale = 'fr' }) {
  const fr = locale !== 'en';
  return (
    <header className="journey-header">
      <button className="journey-back" onClick={onBack}>← {fr ? 'Univers' : 'Universe'}</button>
      <div className="journey-brand">{journey.name} <span>{fr ? 'JOURNEY' : 'JOURNEY'}</span></div>
      <div className="journey-period">{journey.periodStart} — {journey.periodEnd}</div>
    </header>
  );
}
