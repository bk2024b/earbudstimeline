import { generateStory } from '@/lib/brandJourney';

export default function JourneyStory({ chapter, previous, locale = 'fr', isCurated }) {
  const fr = locale !== 'en';
  return (
    <div className="journey-story">
      <div className="journey-year">{chapter.year}</div>
      <h1>{chapter.name}</h1>
      {chapter.gamme && <div className="journey-gamme">{chapter.gamme}</div>}
      {chapter.tagline && <p className="journey-tagline">{chapter.tagline}</p>}
      <p className="journey-narrative">{generateStory(chapter, previous)}</p>
      {chapter.editorial && <p className="journey-editorial">{chapter.editorial}</p>}
      <div className="journey-step">{fr ? 'Étape' : 'Step'} · {isCurated ? (fr ? 'temps fort sélectionné' : 'selected highlight') : (fr ? 'modèle' : 'model')}</div>
    </div>
  );
}
