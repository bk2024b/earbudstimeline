'use client';

import { useEffect, useState } from 'react';

/**
 * Table des matières d'un article :
 * - colonne sticky sur desktop (xl+), qui surligne la section en cours de lecture
 * - bloc repliable ("Dans cet article") sur mobile/tablette
 *
 * Un seul IntersectionObserver alimente les deux rendus, qui partagent le
 * même état `activeId` : pas de logique dupliquée entre les deux variantes.
 */
export default function TableOfContents({ items = [], title, mobileTitle }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);

  useEffect(() => {
    const headingEls = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!headingEls.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      // Bande d'activation : ~100px sous le haut de l'écran jusqu'à 70% de la hauteur,
      // pour que la section "active" corresponde à ce que le lecteur voit vraiment.
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  function closeDetails(event) {
    event.currentTarget.closest('details')?.removeAttribute('open');
  }

  const List = ({ onNavigate }) => (
    <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
      {items.map((item) => (
        <li key={item.id} style={{ marginLeft: `${Math.max(0, item.level - 2) * 0.85}rem` }}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            aria-current={activeId === item.id ? 'location' : undefined}
            className={`block py-1.5 pl-3 border-l-2 text-[13px] leading-snug transition-colors ${
              activeId === item.id
                ? 'border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-fg hover:border-fg'
            }`}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop : colonne sticky à gauche de l'article */}
      <nav
        aria-label={title}
        className="hidden xl:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-3"
      >
        <p className="text-xs uppercase tracking-[0.1em] text-dim mb-3 m-0">{title}</p>
        <div className="mt-3">
          <List />
        </div>
      </nav>

      {/* Mobile / tablette : bloc repliable */}
      <details className="xl:hidden mb-8 rounded-2xl border border-line bg-panel overflow-hidden">
        <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 text-sm font-medium flex items-center justify-between gap-2">
          <span>{mobileTitle}</span>
          <span aria-hidden="true" className="text-dim">↓</span>
        </summary>
        <div className="px-4 pb-4 pt-1">
          <List onNavigate={closeDetails} />
        </div>
      </details>
    </>
  );
}
