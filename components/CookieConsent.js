'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONSENT_GRANTED, CONSENT_DENIED, readConsentClient, writeConsentClient } from '@/lib/consent';

// CMP minimal : un seul choix binaire (accepter / continuer sans accepter),
// pas de granularité par catégorie. Ajouté suite à un audit — le site
// charge Google Analytics, Microsoft Clarity (enregistrement de session) et
// des publicités Adsterra sans qu'aucun consentement ne soit demandé, ce qui
// pose un problème pour le trafic UE (RGPD) et fait tourner ces scripts pour
// tout le monde, y compris les visiteurs qui préféreraient les refuser.
//
// GoogleAnalytics.js et MicrosoftClarity.js (Server Components) lisent ce
// même cookie via next/headers `cookies()` et ne rendent leur <Script> que
// si le consentement est accordé. AdSlot.js (Client Component) le lit côté
// client de la même façon. router.refresh() après un choix permet aux
// Server Components de re-render avec la nouvelle valeur du cookie sans
// recharger toute la page.
export default function CookieConsent() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'hidden' | 'visible'
  const router = useRouter();
  const t = useTranslations('cookieConsent');

  useEffect(() => {
    setStatus(readConsentClient() ? 'hidden' : 'visible');
  }, []);

  function choose(value) {
    writeConsentClient(value);
    setStatus('hidden');
    router.refresh();
  }

  if (status !== 'visible') return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('message')}
      className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5 bg-panel border-t border-line shadow-2xl"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="text-xs sm:text-sm text-dim flex-1 leading-relaxed">
          {t('message')}{' '}
          <Link href="/confidentialite" className="underline hover:text-fg">
            {t('learnMore')}
          </Link>
        </p>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => choose(CONSENT_DENIED)}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-panel2 hover:bg-panel2/80 border border-line text-dim hover:text-fg rounded-xl px-4 py-2.5 transition-colors"
          >
            {t('decline')}
          </button>
          <button
            type="button"
            onClick={() => choose(CONSENT_GRANTED)}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-accent text-ink font-semibold rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
