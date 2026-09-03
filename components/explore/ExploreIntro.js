'use client';

export default function ExploreIntro({ locale = 'fr', onBegin, onSkip }) {
  const fr = locale !== 'en';
  return (
    <section className="explore-intro-screen" aria-labelledby="explore-intro-title">
      <div className="explore-intro-kicker">EarbudsTimeline / Explore</div>
      <h1 id="explore-intro-title">{fr ? "Voyagez dans l'évolution des écouteurs sans fil." : 'Travel through the evolution of wireless earbuds.'}</h1>
      <div className="explore-intro-years">2016 <span /> {fr ? "Aujourd'hui" : 'Today'}</div>
      <button className="explore-primary-cta" onClick={onBegin}>{fr ? 'Commencer l’exploration' : 'Begin exploring'} <span>→</span></button>
      <button className="explore-skip" onClick={onSkip}>{fr ? 'Passer l’introduction' : 'Skip intro'} →</button>
    </section>
  );
}
