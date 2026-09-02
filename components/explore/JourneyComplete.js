'use client';

export default function JourneyComplete({ journey, onExploreAnother, onViewProducts, onCompare, locale = 'fr' }) {
  const fr = locale !== 'en';
  return (
    <section className="journey-complete-screen" aria-labelledby="journey-complete-title">
      <div className="complete-kicker">{journey.name} / {fr ? 'PARCOURS TERMINÉ' : 'JOURNEY COMPLETE'}</div>
      <div className="complete-mark">✓</div>
      <h1 id="journey-complete-title">{fr ? 'Vous avez traversé son évolution.' : 'You have crossed its evolution.'}</h1>
      <p>{journey.periodStart} — {journey.periodEnd} · {journey.totalCount} {fr ? 'modèles dans la timeline' : 'models in the timeline'}</p>
      <div className="complete-actions">
        <button className="explore-primary-cta" onClick={onExploreAnother}>{fr ? 'Explorer une autre marque' : 'Explore another brand'} <span>→</span></button>
        <button className="complete-secondary" onClick={onViewProducts}>{fr ? `Voir tous les ${journey.name}` : `View all ${journey.name} earbuds`}</button>
        {journey.chapterCount > 1 && <button className="complete-secondary" onClick={onCompare}>{fr ? `Comparer l’évolution de ${journey.name}` : `Compare ${journey.name}'s evolution`}</button>}
      </div>
    </section>
  );
}
