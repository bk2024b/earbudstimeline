// lib/installPrompt.js
//
// Petit module de support pour components/InstallPrompt.js. Toute la logique
// d'état (dismiss, cooldown) vit dans localStorage — pas de cookie, pas de
// requête serveur, ce popup ne dépend pas de CONSENT_GRANTED (cf. lib/consent.js)
// puisqu'il ne pose aucun tracker tiers.
//
// Trois états possibles, stockés sous une seule clé JSON :
//   - jamais interagi            -> pas de clé -> on peut proposer
//   - "plus tard" cliqué         -> { status: 'dismissed', at: <timestamp> }
//     -> on repropose après DISMISS_COOLDOWN_DAYS
//   - installé (accepté et/ou détecté standalone) -> { status: 'installed', at }
//     -> on ne repropose plus jamais

const STORAGE_KEY = 'a2hs_prompt_state';
const DISMISS_COOLDOWN_DAYS = 14;

export function readInstallPromptState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeInstallPromptState(status) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée stricte, quota...) : on
    // continue sans persister, le popup pourra juste réapparaître à la
    // prochaine session.
  }
}

export function markInstallPromptDismissed() {
  writeInstallPromptState('dismissed');
}

export function markInstallPromptInstalled() {
  writeInstallPromptState('installed');
}

// Vrai si on a le droit de (re)proposer le popup maintenant, compte tenu de
// l'historique stocké.
export function canShowInstallPrompt() {
  const state = readInstallPromptState();
  if (!state) return true;
  if (state.status === 'installed') return false;
  if (state.status === 'dismissed') {
    const elapsedDays = (Date.now() - state.at) / (1000 * 60 * 60 * 24);
    return elapsedDays >= DISMISS_COOLDOWN_DAYS;
  }
  return true;
}

// Détecte si le site tourne déjà en mode "installé" (lancé depuis l'écran
// d'accueil), toutes plateformes confondues : display-mode: standalone
// couvre Android/desktop, navigator.standalone est le fallback historique
// iOS Safari (avant que standalone rejoigne matchMedia).
export function isRunningStandalone() {
  if (typeof window === 'undefined') return false;
  const viaMediaQuery = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const viaIosLegacy = window.navigator?.standalone === true;
  return Boolean(viaMediaQuery || viaIosLegacy);
}

// iOS/iPadOS n'expose pas `beforeinstallprompt` : on ne peut jamais
// déclencher l'installation par code, seulement montrer des instructions
// ("Partager -> Sur l'écran d'accueil"). iPadOS 13+ usurpe le user agent
// Mac, d'où le test navigator.maxTouchPoints pour le détecter quand même.
export function isIos() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua);
  const isIpadOsAsMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return isAppleTouch || isIpadOsAsMac;
}

// N'affiche les instructions iOS que dans Safari : Chrome/Firefox/etc. sur
// iOS n'ont de toute façon aucun moyen d'installer une PWA (contrainte
// d'Apple, pas de nos guides), les instructions y seraient trompeuses.
export function isIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return isIos() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}
