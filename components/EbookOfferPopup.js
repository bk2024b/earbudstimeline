'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { readConsentClient } from '@/lib/consent';
import { canShowEbookOffer, markEbookOfferDismissed, markEbookOfferClicked } from '@/lib/ebookOffer';
import { claimPopupSlot, releasePopupSlot } from '@/lib/popupSlot';
import { X, BookOpen } from 'lucide-react';

const CHECKOUT_URL = 'https://yrseymcg.mychariow.shop/howtochoosetherightearbuds';

// Déclenchement au temps de présence seul, sans condition de scroll.
const ENGAGEMENT_MS = 10000;

// Pages à forte intention d'achat : guides et articles (le lecteur évalue
// activement des écouteurs), comparaisons, fiches produit, et la home
// (vitrine principale, trafic le plus large). Pas les pages de listing
// secondaires (marques, technologies, index guides/blog) — moins
// contextuel à cet endroit précis.
function isEligibleRoute(pathname) {
  if (!pathname) return false;
  if (pathname === '/') return true;
  const prefixes = ['/guides/', '/blog/', '/comparaisons/', '/ecouteurs/'];
  return prefixes.some((p) => pathname.startsWith(p));
}

function trackEvent(name) {
  try {
    window.dataLayer?.push({ event: name });
  } catch {
    // silencieux : le tracking n'est jamais bloquant pour l'UX
  }
}

export default function EbookOfferPopup() {
  const t = useTranslations('ebookOffer');
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const engagedRef = useRef(false);

  function tryShow() {
    if (!engagedRef.current) return;
    if (!isEligibleRoute(pathname)) return;
    if (!canShowEbookOffer()) return;
    if (!claimPopupSlot()) return; // InstallPrompt (ou un futur popup) occupe déjà la place
    setVisible(true);
    trackEvent('ebook_offer_shown');
  }

  useEffect(() => {
    if (!isEligibleRoute(pathname) || !canShowEbookOffer()) return;

    // Même séquencement qu'InstallPrompt : on attend que le bandeau cookies
    // soit traité avant de démarrer le chrono d'engagement, pour ne jamais
    // empiler un bandeau non-résolu avec ce popup.
    let pollId = null;
    let timeoutId = null;
    let elapsedBeforePause = 0;
    let segmentStart = null;

    function scheduleCheck(remaining) {
      timeoutId = window.setTimeout(() => {
        engagedRef.current = true;
        tryShow();
      }, remaining);
    }

    function handleVisibilityChange() {
      if (!segmentStart) return;
      if (document.hidden) {
        elapsedBeforePause += performance.now() - segmentStart;
        if (timeoutId) window.clearTimeout(timeoutId);
      } else {
        segmentStart = performance.now();
        scheduleCheck(Math.max(0, ENGAGEMENT_MS - elapsedBeforePause));
      }
    }

    function startEngagementTimer() {
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
    markEbookOfferDismissed();
    releasePopupSlot();
    setVisible(false);
    trackEvent('ebook_offer_dismissed');
  }

  function handleBuyClick() {
    markEbookOfferClicked();
    trackEvent('ebook_offer_clicked');
    // Le slot n'est pas explicitement libéré ici : l'utilisateur quitte la
    // page (nouvel onglet vers le checkout), pas besoin de laisser la place
    // à un autre popup sur la page qu'il est en train de quitter.
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
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-panel2 border border-line relative">
          <Image src="/ebook-cover.png" alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-accent">
            <BookOpen className="w-3 h-3" />
            {t('badge')}
          </span>
          <p className="font-display font-semibold text-sm text-fg mt-0.5">{t('title')}</p>
          <p className="text-xs text-dim mt-1 leading-relaxed">{t('body')}</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-1 text-xs sm:text-sm bg-panel2 hover:bg-panel2/80 border border-line text-dim hover:text-fg rounded-xl px-4 py-2.5 transition-colors"
        >
          {t('dismiss')}
        </button>
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBuyClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-accent text-ink font-semibold rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          {t('cta')} · {t('price')}
        </a>
      </div>
    </div>
  );
}
