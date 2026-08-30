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
    <div ref={panelRef} className="fixed bottom-5 right-5 z-30">
      {open && (
        <div className="mb-3 w-[280px] sm:w-[320px] bg-panel border border-line rounded-base shadow-glow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <span className="path-indicator text-accent">
              {en ? 'Discovery trail' : 'Fil de découverte'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-dim hover:text-fg"
              aria-label={en ? 'Close' : 'Fermer'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[280px] overflow-y-auto py-1.5">
            {trail.map((entry, i) => (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-2.5 px-4 py-2 hover:bg-panel2 transition-colors"
              >
                <span className="font-mono text-[10px] text-dim mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-fg leading-snug">{entry.title}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={clearTrail}
            className="w-full flex items-center gap-1.5 justify-center px-4 py-2.5 border-t border-line text-[11px] text-dim hover:text-fg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            {en ? 'Clear trail' : 'Effacer le fil'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-panel border border-line hover:border-accent/40 rounded-full pl-3 pr-4 py-2 shadow-glow text-xs text-dim hover:text-fg transition-colors"
      >
        <Compass className="w-3.5 h-3.5 text-accent" />
        <span>
          {en ? 'Your trail' : 'Votre fil'} · {trail.length} {en ? 'discoveries' : 'découvertes'}
        </span>
      </button>
    </div>
  );
}
