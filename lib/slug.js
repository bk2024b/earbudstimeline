export function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Tries to match an uploaded filename (without path) to an earbud record.
 * Priority: exact id slug -> exact name slug -> exact "brand-name" slug ->
 * unambiguous partial match on the name. Returns the matched earbud or null.
 */
export function matchEarbudByFilename(filename, earbuds) {
  const base = slugify(filename.replace(/\.[a-z0-9]+$/i, ''));
  if (!base || !earbuds?.length) return null;

  let hit = earbuds.find((e) => slugify(e.id) === base);
  if (hit) return hit;

  hit = earbuds.find((e) => slugify(e.name) === base);
  if (hit) return hit;

  hit = earbuds.find((e) => slugify(`${e.brand_id}-${e.name}`) === base);
  if (hit) return hit;

  const candidates = earbuds.filter((e) => {
    const nameSlug = slugify(e.name);
    return nameSlug.length > 2 && (base.includes(nameSlug) || nameSlug.includes(base));
  });
  if (candidates.length === 1) return candidates[0];

  return null;
}
