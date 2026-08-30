'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';

// Dropdown de nav générique, ouvert au hover (desktop) et au clic
// (clavier/touch), fermé au Escape ou au clic extérieur. Pensé pour
// regrouper plusieurs liens de nav existants sous un seul label (ex.
// "Database" = Explore + Timeline + Insights) sans dupliquer la logique
// active/hover déjà présente dans Header.js pour chaque lien simple.
//
// items: [{ href, label, description? }]
export default function NavDropdown({ label, items, className = '' }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);
  const pathname = usePathname();
  const menuId = useId();

  const isAnyActive = items.some(({ href }) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)
  );

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${className}`}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 transition-colors ${
          isAnyActive ? 'text-fg font-semibold' : 'text-dim hover:text-fg'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full mt-2 min-w-[180px] rounded-base border border-line bg-panel py-1.5 shadow-glow z-30"
        >
          {items.map(({ href, label: itemLabel, description }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                className={`block px-3.5 py-2 text-sm transition-colors ${
                  active ? 'text-accent' : 'text-dim hover:text-fg'
                }`}
              >
                <span className="block font-medium">{itemLabel}</span>
                {description && <span className="block text-xs text-dim mt-0.5">{description}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
