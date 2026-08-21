import Script from 'next/script';

// Microsoft Clarity (heatmaps + session recordings). Ne s'active que si
// NEXT_PUBLIC_CLARITY_ID est renseigné, sur le même principe que le
// preconnect Supabase conditionnel dans app/layout.js — évite un script
// cassé/vide en local ou preview tant que l'ID n'est pas configuré.
// `strategy="afterInteractive"` : ne bloque jamais le rendu initial, chargé
// juste après l'hydratation, cohérent avec l'approche perf du reste du site.
export default function MicrosoftClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!projectId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}
