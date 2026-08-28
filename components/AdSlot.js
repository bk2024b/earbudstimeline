'use client';

import { useEffect, useRef, useState } from 'react';
import { CONSENT_GRANTED, readConsentClient } from '@/lib/consent';

/**
 * Emplacement publicitaire Adsterra.
 *
 * variant="banner" (défaut) : format atOptions/iframe classique (ex: Leaderboard
 *   728x90, Medium Rectangle 300x250). Props requises : zoneKey, width, height,
 *   invokeDomain.
 *
 * variant="native" : Native Banner, s'intègre au style du contenu qui l'entoure.
 *   Props requises : zoneKey, invokeDomain.
 *
 * `label` (optionnel) : petite mention "Publicité"/"Advertisement" affichée
 * au-dessus pour la transparence — utile sur les Native Banners noyés dans du
 * contenu éditorial.
 *
 * Chaque emplacement doit avoir sa propre zone créée dans le dashboard
 * Adsterra (donc son propre zoneKey) pour des stats fiables par placement —
 * ne réutilise pas la même zone à plusieurs endroits d'une même page.
 */
export default function AdSlot({
  variant = 'banner',
  zoneKey,
  width = 728,
  height = 90,
  invokeDomain,
  label,
  className = '',
}) {
  const containerRef = useRef(null);
  const [hasConsent, setHasConsent] = useState(false);

  // Lu une fois au montage : CookieConsent.js appelle router.refresh() après
  // un choix, ce qui remonte les Server Components mais pas forcément ce
  // Client Component déjà monté plus bas dans l'arbre sur la même page — un
  // écouteur sur le storage/cookie suffit ici vu que l'essentiel des cas
  // (bannière visible en haut de la première page vue) recharge de toute
  // façon la portion de page où vivent les emplacements pub suivants.
  useEffect(() => {
    setHasConsent(readConsentClient() === CONSENT_GRANTED);
  }, []);

  useEffect(() => {
    if (!hasConsent || !containerRef.current || !zoneKey || !invokeDomain) return;
    const container = containerRef.current;
    container.replaceChildren();

    if (variant === 'native') {
      const nativeDiv = document.createElement('div');
      nativeDiv.id = `container-${zoneKey}`;
      container.appendChild(nativeDiv);

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = `https://${invokeDomain}/${zoneKey}/invoke.js`;
      container.appendChild(script);
    } else {
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.text = `atOptions = {
        'key': '${zoneKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };`;
      container.appendChild(optionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.src = `https://${invokeDomain}/${zoneKey}/invoke.js`;
      container.appendChild(invokeScript);
    }

    return () => {
      container.replaceChildren();
    };
  }, [hasConsent, variant, zoneKey, width, height, invokeDomain]);

  if (!hasConsent || !zoneKey || !invokeDomain) return null;

  return (
    <div className={`not-prose flex flex-col items-center gap-1.5 my-8 ${className}`}>
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-dim/50">{label}</span>
      )}
      <div
        ref={containerRef}
        style={variant === 'banner' ? { minHeight: height, minWidth: Math.min(width, 320) } : { minHeight: 100, width: '100%' }}
      />
    </div>
  );
}
