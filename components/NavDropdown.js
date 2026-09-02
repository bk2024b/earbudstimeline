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
          className="absolute left-0 top-full mt-2.5 min-w-[210px] rounded-base border border-line bg-[#111111] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50 animate-fadeIn overflow-hidden"
        >
          {items.map(({ href, label: itemLabel, description }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-xs uppercase tracking-wider font-display border-b border-line/40 last:border-b-0 transition-colors ${
                  active
                    ? 'bg-[#1a1a1a] text-accent font-semibold'
                    : 'bg-[#111111] text-dim hover:text-fg hover:bg-[#181818]'
                }`}
              >
                <span className="block">{itemLabel}</span>
                {description && <span className="block text-[10px] text-dim normal-case font-normal mt-0.5">{description}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
