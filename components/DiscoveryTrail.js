'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Compass, X, Trash2 } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';

const STORAGE_KEY = 'et-discovery-trail';
const MAX_ENTRIES = 8;

// Familles de routes suivies par le trail — volontairement limité à celles
// actées dans le plan (fiche produit, article, timeline, insights) plutôt
// qu'à toutes les routes du site, pour rester un "voyage" ciblé et pas un
// historique de navigation générique.
function isTrackedPath(path) {
  return (
    /^\/ecouteurs\/[^/]+$/.test(path) ||
    /^\/blog\/[^/]+$/.test(path) ||
    path === '/timeline' ||
    path === '/insights'
  );
}

// "AirPods Pro 2 — EarbudsTimeline" → "AirPods Pro 2" ; mais un titre comme
// "AirPods Pro 2 — Apple" (fiche produit) garde son second segment, qui est
// une info utile (marque), pas un suffixe de site.
function cleanTitle(rawTitle) {
  const parts = rawTitle.split(' — ');
  if (parts.length > 1 && parts[parts.length - 1].trim().toLowerCase() === 'earbudstimeline') {
    parts.pop();
  }
  return parts.join(' — ').trim();
}

function readTrail() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTrail(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Stockage indisponible (navigation privée, quota) — le trail reste
    // simplement vide pour cette session, aucune erreur visible.
  }
}

export default function DiscoveryTrail({ locale }) {
  const pathname = usePathname();
  const [trail, setTrail] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const en = locale === 'en';

  // Charge le trail existant au montage (après hydratation, localStorage
  // n'existe pas côté serveur).
  useEffect(() => {
    setTrail(readTrail());
  }, []);

  // Enregistre la page courante si elle fait partie des familles suivies.
  useEffect(() => {
    if (!isTrackedPath(pathname)) return;
    // document.title est déjà posé par generateMetadata de la page — aucun
    // fetch supplémentaire nécessaire pour obtenir un libellé lisible.
    const title = cleanTitle(document.title || pathname);

    setTrail((prev) => {
      const withoutCurrent = prev.filter((e) => e.href !== pathname);
      const next = [...withoutCurrent, { href: pathname, title, ts: Date.now() }].slice(-MAX_ENTRIES);
      writeTrail(next);
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const clearTrail = useCallback(() => {
    writeTrail([]);
    setTrail([]);
    setOpen(false);
  }, []);

  if (trail.length === 0) return null;

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-[300px] sm:w-[340px] glass-panel bg-panel/95 border border-line/80 shadow-2xl overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel2/50">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent" />
              <span className="path-indicator text-accent text-[11px]">
                {en ? 'Discovery trail' : 'Fil de découverte'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-dim hover:text-fg p-1 rounded hover:bg-panel"
              aria-label={en ? 'Close' : 'Fermer'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[280px] overflow-y-auto py-2 divide-y divide-line/30">
            {trail.map((entry, i) => (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-panel2/70 transition-colors group"
              >
                <span className="font-mono text-[10px] text-accent/80 mt-0.5 shrink-0 bg-accent/10 px-1 rounded">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-fg group-hover:text-accent transition-colors leading-snug">{entry.title}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={clearTrail}
            className="w-full flex items-center gap-1.5 justify-center px-4 py-2.5 border-t border-line/60 bg-panel2/30 text-[11px] text-dim hover:text-fg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {en ? 'Clear trail' : 'Effacer le fil'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 glass-panel bg-panel/90 hover:border-accent/50 px-3.5 py-2 shadow-lg text-xs font-display font-medium text-dim hover:text-fg transition-all hover:scale-105"
      >
        <Compass className="w-4 h-4 text-accent animate-pulse" />
        <span>
          {en ? 'Your trail' : 'Votre fil'} ({trail.length})
        </span>
      </button>
    </div>
  );
}
