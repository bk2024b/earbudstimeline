'use client';

import { useEffect, useRef } from 'react';

/**
 * Emplacement publicitaire Adsterra.
 *
 * - Réserve l'espace (width/height) dès le rendu pour éviter tout saut de
 *   mise en page (CLS) pendant le chargement du script tiers.
 * - Nettoie les scripts injectés au démontage (utile en navigation client Next.js).
 * - Le label "Publicité"/"Advertisement" garde la transparence vis-à-vis des visiteurs.
 *
 * Format "banner" (ex. 728x90, 300x250...) — nécessite juste la clé de zone Adsterra.
 * Format "native" — colle l'URL exacte du script fournie par Adsterra pour ta
 * Native Banner (elle contient un identifiant différent du "key" du banner classique).
 */
export default function AdSlot({
  zoneKey,
  width = 728,
  height = 90,
  format = 'banner',
  // Domaine fourni par Adsterra pour cette zone précise (visible dans le <script src="...">
  // qu'ils te donnent). Il peut varier d'une zone à l'autre, d'où le rendre configurable
  // plutôt que codé en dur.
  invokeDomain = 'www.highrevenueformat.com',
  nativeScriptSrc,
  label = 'Publicité',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    if (format === 'native') {
      if (!nativeScriptSrc) return;
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = nativeScriptSrc;
      container.appendChild(script);
    } else {
      if (!zoneKey) return;
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.text = `
        atOptions = {
          'key': '${zoneKey}',
          'format': 'iframe',
          'height': ${height},
          'width': ${width},
          'params': {}
        };
      `;
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `https://${invokeDomain}/${zoneKey}/invoke.js`;

      container.appendChild(optionsScript);
      container.appendChild(invokeScript);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [zoneKey, width, height, format, invokeDomain, nativeScriptSrc]);

  // Rien à afficher si aucune clé n'est configurée (ex. en local/dev sans .env)
  if (!zoneKey && !nativeScriptSrc) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 mt-10 mb-4">
      <span className="text-[10px] uppercase tracking-widest text-dim">{label}</span>
      <div
        ref={containerRef}
        style={{ minWidth: format === 'native' ? '100%' : width, minHeight: height }}
        className="flex items-center justify-center overflow-hidden"
      />
    </div>
  );
}
