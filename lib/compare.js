import { pct } from './format';

// Le rival le plus pertinent : prix le plus proche, autre marque, écart de sortie < 2 ans.
export function findRival(model, allModels) {
  const releaseYear = new Date(model.release_date).getFullYear();
  const candidates = allModels.filter((x) => {
    if (x.id === model.id || x.brand_id === model.brand_id) return false;
    if (!x.price || !model.price) return false;
    const yearDiff = Math.abs(new Date(x.release_date).getFullYear() - releaseYear);
    return yearDiff <= 2;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => Math.abs(a.price - model.price) - Math.abs(b.price - model.price));
  return candidates[0];
}

// Jusqu'à 3 suggestions de comparaison pour un modèle : prédécesseur, successeur, rival concurrent.
// `t` est le traducteur next-intl du namespace "comparisonSuggestions" (getTranslations côté serveur).
export function getComparisonSuggestions(model, { prev, next, allModels, t }) {
  const suggestions = [];
  if (prev) suggestions.push({ model: prev, reason: t('reasonPrev') });
  if (next) suggestions.push({ model: next, reason: t('reasonNext') });
  const rival = findRival(model, allModels);
  if (rival) suggestions.push({ model: rival, reason: t('reasonRival') });
  return suggestions;
}

// Liste de bullets "+ / -" décrivant les différences clés entre `model` (référence) et `other`.
// `t` est le traducteur next-intl du namespace "diff".
export function buildDiffBullets(model, other, t) {
  const bullets = [];

  if (model.anc && !other.anc) bullets.push({ sign: '+', text: t('gainsAnc') });
  if (!model.anc && other.anc) bullets.push({ sign: '-', text: t('losesAnc') });

  const battDiff = pct(Number(model.battery_bud_h), Number(other.battery_bud_h));
  if (battDiff !== null && Math.abs(battDiff) >= 10) {
    bullets.push({
      sign: battDiff > 0 ? '+' : '-',
      text: t('batteryEarbudPct', { sign: battDiff > 0 ? '+' : '', value: battDiff }),
    });
  }

  const caseDiff = pct(Number(model.battery_case_h), Number(other.battery_case_h));
  if (caseDiff !== null && Math.abs(caseDiff) >= 10) {
    bullets.push({
      sign: caseDiff > 0 ? '+' : '-',
      text: t('batteryTotalPct', { sign: caseDiff > 0 ? '+' : '', value: caseDiff }),
    });
  }

  const weightDiff = pct(Number(model.weight_g), Number(other.weight_g));
  if (weightDiff !== null && Math.abs(weightDiff) >= 5) {
    bullets.push({
      sign: weightDiff < 0 ? '+' : '-',
      text:
        weightDiff < 0
          ? t('lighterPct', { value: Math.abs(weightDiff) })
          : t('heavierPct', { value: weightDiff }),
    });
  }

  if (model.water_rating !== other.water_rating) {
    bullets.push({ sign: '·', text: t('ratingVs', { a: model.water_rating, b: other.water_rating }) });
  }

  if (model.bluetooth !== other.bluetooth) {
    bullets.push({ sign: '·', text: t('bluetoothVs', { a: model.bluetooth, b: other.bluetooth }) });
  }

  if (model.usb_c && !other.usb_c) bullets.push({ sign: '+', text: t('gainsUsbC') });
  if (!model.usb_c && other.usb_c) bullets.push({ sign: '-', text: t('losesUsbC') });

  if (model.multipoint && !other.multipoint) bullets.push({ sign: '+', text: t('gainsMultipoint') });
  if (!model.multipoint && other.multipoint) bullets.push({ sign: '-', text: t('losesMultipoint') });

  if (model.codec !== other.codec && model.codec !== '—' && other.codec !== '—') {
    bullets.push({ sign: '·', text: t('codecVs', { a: model.codec, b: other.codec }) });
  }

  if (model.price && other.price && model.price !== other.price) {
    const priceDiff = model.price - other.price;
    bullets.push({
      sign: priceDiff < 0 ? '+' : '-',
      text:
        priceDiff < 0
          ? t('cheaperBy', { value: Math.abs(priceDiff) })
          : t('pricierBy', { value: priceDiff }),
    });
  }

  return bullets;
}

// Pour la page /comparaisons : les paires "devancier -> successeur" au sein d'une même gamme.
export function getGenerationalPairs(allModels) {
  const byLine = new Map();
  for (const m of allModels) {
    const key = `${m.brand_id}::${m.gamme}`;
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(m);
  }
  const pairs = [];
  for (const models of byLine.values()) {
    if (models.length < 2) continue;
    const sorted = [...models].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    for (let i = 1; i < sorted.length; i++) {
      pairs.push({ a: sorted[i], b: sorted[i - 1] });
    }
  }
  return pairs;
}

// Paires cross-marques par tranche de prix proche, dédupliquées.
export function getRivalPairs(allModels, limit = 12) {
  const seen = new Set();
  const pairs = [];
  const sorted = [...allModels].filter((m) => m.price).sort((a, b) => a.price - b.price);

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a.brand_id === b.brand_id) continue;
    const key = [a.id, b.id].sort().join('::');
    if (seen.has(key)) continue;
    if (Math.abs(a.price - b.price) > 60) continue;
    seen.add(key);
    pairs.push({ a, b });
    if (pairs.length >= limit) break;
  }
  return pairs;
}
