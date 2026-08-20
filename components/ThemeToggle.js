'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  // null tant qu'on n'a pas lu localStorage côté client, pour ne pas afficher
  // une icône incohérente avec le thème réellement appliqué (déjà posé par le
  // script anti-flash dans app/layout.js) le temps de l'hydratation.
  const [isLight, setIsLight] = useState(null);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('light');
    document.documentElement.classList.toggle('light', next);
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark');
    } catch {
      // localStorage indisponible (navigation privée stricte, etc.) : le thème
      // ne persistera pas d'une visite à l'autre, mais le bouton reste fonctionnel.
    }
    setIsLight(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Passer au thème sombre' : 'Passer au thème clair'}
      className="w-11 h-11 flex items-center justify-center rounded-full border border-line text-dim hover:text-accent hover:border-accent transition-colors shrink-0"
    >
      {isLight === null ? (
        <span className="w-4 h-4" />
      ) : isLight ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
}
