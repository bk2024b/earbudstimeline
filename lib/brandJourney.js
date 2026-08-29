// lib/brandJourney.js
//
// Data engine for the "Explore" immersive brand-journey tool.
// Pure functions only — no fetching, no DOM. Feed it the real rows from
// getAllEarbuds() / getBrands() (lib/queries.js) and it returns a
// display-ready structure for components/explore/ExploreExperience.js.
//
// Hard rule enforced by design: this module NEVER invents a spec, a date,
// or a product name. Every field in the output traces back to a real
// column on the `earbuds` row passed in. The only hand-written text is
// EDITORIAL_OVERLAY below, which is framing prose (not specs) applied to
// a small, explicit allow-list of real earbud ids.

const MAX_CHAPTERS_PER_BRAND = 8;
const MIN_MARQUANT_CHAPTERS = 4;

/**
 * Hand-written editorial overlay — restricted to Apple and Sony per the
 * "flagship brand" decision. Keyed by the real earbuds.id. Every other
 * brand relies entirely on generateStory() below (auto, spec-diff based).
 * Adding a brand here later just means adding entries — nothing else
 * needs to change.
 */
export const EDITORIAL_OVERLAY = {
  ap1: "Personne, y compris chez Apple, ne savait encore si des écouteurs sans câble ni bouton allaient réellement fonctionner au quotidien. AirPods a répondu à cette question pour toute une industrie.",
  apm1: "Un format totalement différent du reste de la gamme — signe qu'Apple ne voyait déjà plus « AirPods » comme une seule forme de produit, mais comme une marque d'écoute sans fil à part entière.",
  app2l: "La puce H2 marque le moment où la gamme Pro cesse d'être un simple « AirPods plus cher » pour devenir la vitrine technologique de toute la marque.",
  app3: "Près de dix ans après le premier modèle, la question n'est plus « le sans-fil marche-t-il ? » mais « que peut encore mesurer un écouteur ? ».",
  s1000x1: "Trois heures d'autonomie et pas de résistance à l'eau : le WF-1000X est un brouillon assumé. Mais c'est le brouillon qui a donné naissance à la gamme XM.",
  s1000x4: "Le WF-1000XM4 est souvent cité comme la référence ANC de sa génération — pas pour une seule fonctionnalité spectaculaire, mais parce que rien ne dépasse.",
};

function pct(cur, base) {
  const c = Number(cur);
  const b = Number(base);
  if (!Number.isFinite(c) || !Number.isFinite(b) || b === 0) return null;
  return Math.round(((c - b) / b) * 100);
}

/**
 * Auto-generated narrative — same spirit as lib/compare.js buildDiffBullets():
 * describe only what measurably changed between two real rows. Never fills
 * gaps with invented context.
 */
export function generateStory(chapter, prevChapter) {
  if (!prevChapter) {
    return `Premier modèle suivi de la marque, sorti en ${chapter.year}. Base de comparaison pour les modèles suivants.`;
  }
  const bits = [];

  const battDiff = pct(chapter.battery_case_h, prevChapter.battery_case_h);
  if (battDiff !== null && Math.abs(battDiff) >= 8) {
    bits.push(`${battDiff > 0 ? '+' : ''}${battDiff}% d'autonomie totale avec le boîtier`);
  }

  if (chapter.anc && !prevChapter.anc) bits.push("gagne la réduction de bruit active (ANC)");
  if (!chapter.anc && prevChapter.anc) bits.push("perd l'ANC");

  const weightDiff = pct(chapter.weight_g, prevChapter.weight_g);
  if (weightDiff !== null && Math.abs(weightDiff) >= 5) {
    bits.push(weightDiff < 0 ? `${Math.abs(weightDiff)}% plus léger par écouteur` : `${weightDiff}% plus lourd par écouteur`);
  }

  if (chapter.water_rating && chapter.water_rating !== prevChapter.water_rating) {
    bits.push(`certification ${chapter.water_rating}`);
  }

  if (chapter.usb_c && !prevChapter.usb_c) bits.push("passe à l'USB-C");
  if (chapter.multipoint && !prevChapter.multipoint) bits.push("gagne le multipoint");

  if (chapter.price && prevChapter.price && chapter.price !== prevChapter.price) {
    const d = chapter.price - prevChapter.price;
    bits.push(d < 0 ? `${Math.abs(d)} $ moins cher au lancement` : `${d} $ plus cher au lancement`);
  }

  if (bits.length === 0) {
    return `Évolution incrémentale par rapport à ${prevChapter.name}, sans changement majeur sur les caractéristiques suivies.`;
  }
  return `Par rapport à ${prevChapter.name} : ` + bits.join(', ') + '.';
}

/**
 * Picks which real models become "chapters" for a brand's journey.
 * Strategy: chronological, prefer marquant=true milestones; if a brand
 * has fewer than MIN_MARQUANT_CHAPTERS marquant models, fill in with the
 * remaining models (still chronological) until the floor is met. Always
 * keeps the very first and very last model in the brand's real lineup so
 * the journey never silently starts or ends on a fabricated boundary.
 * Caps at MAX_CHAPTERS_PER_BRAND to keep the scrollytelling readable.
 */
export function selectChapters(brandModels) {
  const sorted = [...brandModels].sort((a, b) => a.release_date.localeCompare(b.release_date));
  if (sorted.length <= MAX_CHAPTERS_PER_BRAND) return sorted;

  const marquant = sorted.filter((m) => m.marquant);
  let picked = marquant.length >= MIN_MARQUANT_CHAPTERS ? [...marquant] : [...marquant];

  if (picked.length < MIN_MARQUANT_CHAPTERS) {
    const remaining = sorted.filter((m) => !picked.includes(m));
    const need = MIN_MARQUANT_CHAPTERS - picked.length;
    const step = Math.max(1, Math.floor(remaining.length / need));
    for (let i = 0; i < remaining.length && picked.length < MIN_MARQUANT_CHAPTERS; i += step) {
      picked.push(remaining[i]);
    }
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!picked.includes(first)) picked.push(first);
  if (!picked.includes(last)) picked.push(last);

  picked = picked.sort((a, b) => a.release_date.localeCompare(b.release_date));
  if (picked.length > MAX_CHAPTERS_PER_BRAND) {
    // Trim from the middle, keep first/last and edges of the sequence.
    const overflow = picked.length - MAX_CHAPTERS_PER_BRAND;
    const middleStart = 1;
    picked.splice(middleStart, overflow);
  }
  return picked;
}

function toChapter(model, brand) {
  return {
    id: model.id,
    name: model.name,
    gamme: model.gamme,
    year: model.release_date.slice(0, 4),
    release_date: model.release_date,
    price: model.price ?? null,
    anc: Boolean(model.anc),
    battery_bud_h: model.battery_bud_h ?? null,
    battery_case_h: model.battery_case_h ?? null,
    weight_g: model.weight_g ?? null,
    water_rating: model.water_rating || null,
    bluetooth: model.bluetooth || null,
    usb_c: Boolean(model.usb_c),
    multipoint: Boolean(model.multipoint),
    chip: model.chip || null,
    image_url: model.image_url || null,
    tagline: model.tagline || '',
    marquant: Boolean(model.marquant),
    editorial: EDITORIAL_OVERLAY[model.id] || null,
    brandColor: brand?.color || '#6C8CFF',
  };
}

/**
 * Main entry point. models = getAllEarbuds() rows, brands = getBrands() rows.
 * Returns an array (not an object keyed by name) so brand order can follow
 * "most models first" like the rest of the site (see app/[locale]/page.js
 * topBrands sort), and so brands with zero models are naturally excluded
 * without an explicit denylist.
 */
export function buildBrandJourneys(models, brands) {
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const byBrand = new Map();

  for (const m of models) {
    if (!byBrand.has(m.brand_id)) byBrand.set(m.brand_id, []);
    byBrand.get(m.brand_id).push(m);
  }

  const journeys = [];
  for (const [brandId, brandModels] of byBrand.entries()) {
    if (brandModels.length === 0) continue;
    const brand = brandMap.get(brandId) || { id: brandId, name: brandId, color: '#6C8CFF' };
    const sorted = [...brandModels].sort((a, b) => a.release_date.localeCompare(b.release_date));
    const chapterModels = selectChapters(sorted);
    const chapters = chapterModels.map((m) => toChapter(m, brand));

    const years = sorted.map((m) => Number(m.release_date.slice(0, 4)));
    journeys.push({
      id: brand.id,
      name: brand.name,
      color: brand.color,
      totalCount: sorted.length,
      chapterCount: chapters.length,
      isCurated: chapters.length < sorted.length,
      periodStart: Math.min(...years),
      periodEnd: Math.max(...years),
      chapters,
    });
  }

  journeys.sort((a, b) => b.totalCount - a.totalCount);
  return journeys;
}

/**
 * Era mode: for a given year, what was each brand's most recent model at
 * that point in time? A brand with no release yet gets null (rendered as
 * "not founded yet" in the UI) rather than an invented placeholder.
 */
export function getBrandStateAtYear(journeys, year) {
  return journeys.map((journey) => {
    const eligible = journey.chapters.filter((c) => Number(c.year) <= year);
    const current = eligible.length ? eligible[eligible.length - 1] : null;
    return { ...journey, current };
  });
}

/**
 * Compare mode: first vs last chapter of a journey, plus the deduplicated
 * list of real changes accumulated across every chapter in between —
 * built from generateStory's same diff logic, not hardcoded per brand.
 */
export function buildCompareData(journey) {
  const chapters = journey.chapters;
  const first = chapters[0];
  const last = chapters[chapters.length - 1];

  const changeSet = new Set();
  for (let i = 1; i < chapters.length; i++) {
    const cur = chapters[i];
    const prev = chapters[i - 1];
    if (cur.anc && !prev.anc) changeSet.add('Gagne l\u2019ANC');
    if (cur.usb_c && !prev.usb_c) changeSet.add('Passe à l\u2019USB-C');
    if (cur.multipoint && !prev.multipoint) changeSet.add('Gagne le multipoint');
    if (cur.water_rating && cur.water_rating !== prev.water_rating) changeSet.add(`Certification ${cur.water_rating}`);
  }

  return { first, last, changes: [...changeSet] };
}
