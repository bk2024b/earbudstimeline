'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { readConsentClient } from '@/lib/consent';
import {
  canShowInstallPrompt,
  markInstallPromptDismissed,
  markInstallPromptInstalled,
  isRunningStandalone,
  isIos,
  isIosSafari,
} from '@/lib/installPrompt';
import { claimPopupSlot, releasePopupSlot } from '@/lib/popupSlot';
import { Download, Share, SquarePlus, X } from 'lucide-react';

// Durée de présence active (hors onglet en arrière-plan) avant de proposer
// le popup. Volontairement bas : à 15s l'utilisateur a eu le temps de voir
// qu'il ne s'agit pas d'une page de rebond, sans le faire trop attendre.
const ENGAGEMENT_MS = 15000;

// Ne jamais proposer l'installation sur ces routes : la politique de
// confidentialité et un article de blog sont des pages de lecture, pas le
// bon moment pour interrompre. `/blog` (la liste) reste autorisée.
function isExcludedRoute(pathname) {
  if (!pathname) return false;
  if (pathname === '/confidentialite') return true;
  if (pathname.startsWith('/blog/')) return true;
  return false;
}

// Best-effort : n'envoie l'événement que si un tracker GA a déjà été chargé
// (donc que le consentement cookies est accordé, voir GoogleAnalytics.js).
// Ne jette jamais si dataLayer est absent.
function trackEvent(name) {
  try {
    window.dataLayer?.push({ event: name });
  } catch {
    // silencieux : le tracking n'est jamais bloquant pour l'UX
  }
}

export default function InstallPrompt() {
  const t = useTranslations('installPrompt');
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // 'native' | 'ios' | null
  const deferredPromptRef = useRef(null);
  const engagedRef = useRef(false);
  const platformReadyRef = useRef(false);

  // Tente d'afficher le popup dès que les deux conditions sont réunies :
  // durée d'engagement écoulée ET plateforme prête (event natif capté, ou
  // iOS Safari détecté). L'ordre d'arrivée des deux n'est pas garanti (sur
  // certains Android, `beforeinstallprompt` peut mettre du temps à se
  // déclencher), donc chaque effet rappelle cette fonction indépendamment.
  function tryShow(kind) {
    if (!engagedRef.current || !platformReadyRef.current) return;
    if (isExcludedRoute(pathname)) return;
    if (isRunningStandalone()) return;
    if (!canShowInstallPrompt()) return;
    if (!claimPopupSlot()) return; // un autre popup (ex. EbookOfferPopup) occupe déjà la place
    setPlatform(kind);
    setVisible(true);
    trackEvent('a2hs_prompt_shown');
  }

  useEffect(() => {
    if (isRunningStandalone() || !canShowInstallPrompt() || isExcludedRoute(pathname)) return;

    // Sur iOS, aucune API d'installation : si c'est Safari, la plateforme
    // est "prête" immédiatement, on attend juste l'engagement.
    if (isIos()) {
      if (isIosSafari()) {
        platformReadyRef.current = true;
        tryShow('ios');
      }
      return; // pas d'écouteur beforeinstallprompt à poser sur iOS
    }

    // Chrome/Edge/Android : on capte l'event natif et on empêche le mini-
    // infobar par défaut du navigateur pour afficher notre propre UI à la
    // place, déclenchée par l'engagement plutôt qu'au chargement.
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      deferredPromptRef.current = e;
      platformReadyRef.current = true;
      tryShow('native');
    }
    function handleAppInstalled() {
      markInstallPromptInstalled();
      releasePopupSlot();
      setVisible(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isRunningStandalone() || !canShowInstallPrompt() || isExcludedRoute(pathname)) return;

    // N'attend le déclenchement que si l'utilisateur a déjà traité le
    // bandeau cookies (accepté ou refusé) : évite d'empiler deux bandeaux
    // en bas d'écran au même moment, l'un des deux non-résolu. Le choix est
    // écrit en cookie (pas localStorage) par CookieConsent.js, sans event
    // dédié — un court sondage est plus simple ici qu'un event bus pour un
    // état qui ne change qu'une fois par session.
    let pollId = null;
    let timeoutId = null;
    let elapsedBeforePause = 0;
    let segmentStart = null;

    function scheduleCheck(remaining) {
      timeoutId = window.setTimeout(() => {
        engagedRef.current = true;
        tryShow(platformReadyRef.current ? (isIos() ? 'ios' : 'native') : null);
      }, remaining);
    }

    function handleVisibilityChange() {
      if (!segmentStart) return; // chrono pas encore démarré (consentement pas traité)
      if (document.hidden) {
        elapsedBeforePause += performance.now() - segmentStart;
        if (timeoutId) window.clearTimeout(timeoutId);
      } else {
        segmentStart = performance.now();
        scheduleCheck(Math.max(0, ENGAGEMENT_MS - elapsedBeforePause));
      }
    }

    function startEngagementTimer() {
      // performance.now() plutôt que setTimeout seul : on met le chrono en
      // pause quand l'onglet passe en arrière-plan, pour ne compter que du
      // temps de présence réel (un onglet oublié ouvert 15s ne doit pas
      // déclencher le popup au retour).
      segmentStart = performance.now();
      if (!document.hidden) scheduleCheck(ENGAGEMENT_MS);
    }

    if (readConsentClient() !== null) {
      startEngagementTimer();
    } else {
      pollId = window.setInterval(() => {
        if (readConsentClient() !== null) {
          window.clearInterval(pollId);
          pollId = null;
          startEngagementTimer();
        }
      }, 500);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (pollId) window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function handleDismiss() {
    markInstallPromptDismissed();
    releasePopupSlot();
    setVisible(false);
    trackEvent('a2hs_prompt_dismissed');
  }

  async function handleInstallClick() {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    deferredPromptRef.current = null;
    releasePopupSlot();
    setVisible(false);
    if (choice?.outcome === 'accepted') {
      markInstallPromptInstalled();
      trackEvent('a2hs_prompt_accepted');
    } else {
      markInstallPromptDismissed();
      trackEvent('a2hs_prompt_dismissed');
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-[360px] z-40 rounded-2xl bg-panel border border-line shadow-2xl p-4 animate-[slide-up_0.25s_ease-out]"
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('dismiss')}
        className="absolute top-3 right-3 text-dim hover:text-fg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-5">
        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-panel2 border border-line relative">
          <Image src="/icon-192.png" alt="" fill sizes="40px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm text-fg">{t('title')}</p>
          <p className="text-xs text-dim mt-1 leading-relaxed">
            {platform === 'ios' ? t('iosBody') : t('body')}
          </p>
        </div>
      </div>

      {platform === 'ios' ? (
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-dim">
            <Share className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{t('iosStep1')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-dim">
            <SquarePlus className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{t('iosStep2')}</span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-2.5 w-full text-xs sm:text-sm bg-accent text-ink font-semibold rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            {t('iosDismiss')}
          </button>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 text-xs sm:text-sm bg-panel2 hover:bg-panel2/80 border border-line text-dim hover:text-fg rounded-xl px-4 py-2.5 transition-colors"
          >
            {t('dismiss')}
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-accent text-ink font-semibold rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            {t('install')}
          </button>
        </div>
      )}
    </div>
  );
}
