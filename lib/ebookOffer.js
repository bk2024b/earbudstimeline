// lib/ebookOffer.js
//
// Même logique que lib/installPrompt.js (voir ce fichier pour le
// raisonnement détaillé) appliquée au popup de vente de l'ebook "How to
// Choose the Right Earbuds" (voir components/EbookOfferPopup.js).

const STORAGE_KEY = 'ebook_offer_state';
const DISMISS_COOLDOWN_DAYS = 14;
// Après un clic sur "Acheter", on ne peut pas savoir si le paiement a
// abouti (pas de webhook/page de retour pour l'instant, voir le composant)
// — on part du principe qu'une intention déjà exprimée n'a pas besoin
// d'être re-sollicitée trop vite, sans pour autant l'exclure définitivement
// au cas où l'achat n'ait pas été finalisé.
const CLICKED_COOLDOWN_DAYS = 60;

export function readEbookOfferState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeEbookOfferState(status) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    // Stockage indisponible : on continue sans persister.
  }
}

export function markEbookOfferDismissed() {
  writeEbookOfferState('dismissed');
}

export function markEbookOfferClicked() {
  writeEbookOfferState('clicked');
}

export function canShowEbookOffer() {
  const state = readEbookOfferState();
  if (!state) return true;
  const cooldownDays = state.status === 'clicked' ? CLICKED_COOLDOWN_DAYS : DISMISS_COOLDOWN_DAYS;
  const elapsedDays = (Date.now() - state.at) / (1000 * 60 * 60 * 24);
  return elapsedDays >= cooldownDays;
}
