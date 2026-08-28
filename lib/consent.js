// lib/consent.js
//
// Un seul cookie, deux valeurs possibles : 'granted' ou 'denied'. Pas de
// granularité par catégorie (analytics / ads séparés) pour rester simple —
// c'est un choix binaire volontaire, cohérent avec le reste du site (pas de
// dépendance CMP tierce ajoutée). Utilisé à la fois :
//   - côté client (components/CookieConsent.js, components/AdSlot.js) via
//     document.cookie
//   - côté serveur (components/GoogleAnalytics.js, components/MicrosoftClarity.js)
//     via next/headers `cookies()`
// Pas d'import next/headers ici : ce fichier doit rester importable depuis
// des Client Components sans faire planter le bundle.
export const CONSENT_COOKIE_NAME = 'cookie_consent';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 an
export const CONSENT_GRANTED = 'granted';
export const CONSENT_DENIED = 'denied';

// Lecture côté client uniquement (document.cookie n'existe pas côté serveur).
export function readConsentClient() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeConsentClient(value) {
  if (typeof document === 'undefined') return;
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
}
