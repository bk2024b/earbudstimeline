import { cookies } from 'next/headers';
import Script from 'next/script';
import { CONSENT_COOKIE_NAME, CONSENT_GRANTED } from '@/lib/consent';

// Google Analytics (GA4 via gtag.js). Même principe que MicrosoftClarity.js :
// ne s'active que si NEXT_PUBLIC_GA_ID est renseigné, et vit dans le layout
// [locale] (routes publiques) plutôt que le layout racine, pour ne pas
// polluer les métriques de trafic réel avec l'usage de /admin.
// `strategy="afterInteractive"` suit la recommandation officielle Next.js
// pour gtag.js — chargé après l'hydratation, jamais bloquant pour le rendu.
//
// Ne charge le script que si l'utilisateur a accepté les cookies (voir
// components/CookieConsent.js) — avant ce cookie posé, aucune requête vers
// Google n'est envoyée.
export default async function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  const consent = (await cookies()).get(CONSENT_COOKIE_NAME)?.value;
  if (consent !== CONSENT_GRANTED) return null;

  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
