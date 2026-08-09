import { slugify } from './slug';

// codec est stocké en texte libre séparé par virgules, ex. "AAC, SBC, LDAC".
export function parseCodecs(codecField) {
  if (!codecField || codecField === '—') return [];
  return codecField
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

export function modelHasCodec(model, codecName) {
  return parseCodecs(model.codec).some((c) => slugify(c) === slugify(codecName));
}

// Liste des codecs distincts présents en base, avec nombre de modèles et slug.
export function getCodecList(models) {
  const counts = new Map();
  for (const m of models) {
    for (const c of parseCodecs(m.codec)) {
      const slug = slugify(c);
      if (!counts.has(slug)) counts.set(slug, { name: c, slug, count: 0 });
      counts.get(slug).count += 1;
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

// Liste des versions Bluetooth distinctes présentes en base, avec nombre de modèles.
export function getBluetoothVersionList(models) {
  const counts = new Map();
  for (const m of models) {
    if (!m.bluetooth) continue;
    if (!counts.has(m.bluetooth)) counts.set(m.bluetooth, { version: m.bluetooth, count: 0 });
    counts.get(m.bluetooth).count += 1;
  }
  return [...counts.values()].sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
}
