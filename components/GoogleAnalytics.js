import Script from 'next/script';

// Google Analytics (GA4 via gtag.js). Même principe que MicrosoftClarity.js :
// ne s'active que si NEXT_PUBLIC_GA_ID est renseigné, et vit dans le layout
// [locale] (routes publiques) plutôt que le layout racine, pour ne pas
// polluer les métriques de trafic réel avec l'usage de /admin.
// `strategy="afterInteractive"` suit la recommandation officielle Next.js
// pour gtag.js — chargé après l'hydratation, jamais bloquant pour le rendu.
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

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
