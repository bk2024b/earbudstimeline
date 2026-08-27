import Script from 'next/script';

// Adsterra Social Bar. Même principe que GoogleAnalytics.js / MicrosoftClarity.js :
// ne s'active que si NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SRC est renseignée, et vit dans
// le layout [locale] (routes publiques) plutôt que le layout racine, pour ne jamais
// s'afficher sur /admin.
//
// Pour désactiver rapidement sans toucher au code : vide la variable d'env dans
// Vercel et redéploie — le composant ne rend plus rien.
// Pour retirer complètement : supprime la ligne <SocialBar /> dans
// app/[locale]/layout.js (et ce fichier, si tu veux nettoyer).
export default function SocialBar() {
  const src = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SRC;
  if (!src) return null;

  return <Script src={src} strategy="lazyOnload" />;
}
