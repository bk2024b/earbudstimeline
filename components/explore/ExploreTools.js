'use client';

export default function ExploreTools({ onEra, onCompare, onBack, locale = 'fr' }) {
  const fr = locale !== 'en';
  return (
    <section className="explore-tools-screen">
      <button className="tools-back" onClick={onBack}>← {fr ? 'Univers' : 'Universe'}</button>
      <div className="tools-copy">
        <div className="universe-kicker">{fr ? 'OUTILS D’EXPLORATION' : 'EXPLORATION TOOLS'}</div>
        <h1>{fr ? 'Allez plus loin.' : 'Go deeper.'}</h1>
        <p>{fr ? 'Deux façons d’explorer la timeline au-delà des parcours de marques.' : 'Two ways to explore the timeline beyond brand journeys.'}</p>
      </div>
      <div className="tools-grid">
        <button className="tool-card" onClick={onEra}><span>01</span><strong>{fr ? 'Explorer une époque' : 'Explore an era'}</strong><small>{fr ? 'Voyez ce que chaque marque proposait à une année donnée.' : 'See what each brand offered in a given year.'}</small><b>→</b></button>
        <button className="tool-card" onClick={onCompare}><span>02</span><strong>{fr ? 'Comparer une évolution' : 'Compare an evolution'}</strong><small>{fr ? 'Mesurez le chemin entre le premier et le dernier modèle suivi.' : 'Measure the journey from first to latest tracked model.'}</small><b>→</b></button>
      </div>
    </section>
  );
}
