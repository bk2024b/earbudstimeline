// lib/popupSlot.js
//
// Le site propose maintenant plusieurs popups d'engagement non-intrusifs
// (InstallPrompt, EbookOfferPopup...), tous positionnés en bas d'écran.
// Sans coordination, deux pourraient se déclencher au même moment et
// s'empiler — exactement ce que "non-intrusif" est censé éviter.
//
// Solution volontairement simple : un seul "slot" partagé, premier arrivé
// premier servi, pas de file d'attente. Si un popup perd la course, il ne
// réessaie pas dans la même session — acceptable pour ce cas d'usage (il
// aura d'autres occasions à la prochaine visite) et beaucoup plus simple
// qu'un vrai système de priorité/queue.
//
// Variable de module plutôt que localStorage : la coordination n'a besoin
// de vivre que le temps d'une page chargée, pas d'être persistée.
let occupied = false;

export function claimPopupSlot() {
  if (occupied) return false;
  occupied = true;
  return true;
}

export function releasePopupSlot() {
  occupied = false;
}
