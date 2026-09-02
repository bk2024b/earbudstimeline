// Interpreter for the declarative `filter` / `sort` JSON stored on each row
// of the `guides` table (see supabase/migrations/202608310001_add_guides_table.sql).
//
// Most guides only need simple comparisons (price <= 100, anc = true,
// brand_id in [...]) which the `applyFilter`/`applySort` clauses below cover
// directly from data — no code change needed to add a new guide of this
// shape.
//
// A very small number of guides need real logic that cannot be expressed as
// a field/op/value triple (checking a comma-string OR array field for a
// substring across several possible values). Those live in NAMED_FILTERS /
// NAMED_COMPUTED below. This registry should stay small — if you find
// yourself adding a new named function for something that is really just
// "field contains value", prefer the declarative `contains`/`regex` ops
// instead.

function getField(model, field) {
  return model?.[field];
}

function toCodecList(model) {
  return Array.isArray(model.codecs) && model.codecs.length
    ? model.codecs
    : (typeof model.codec === 'string' ? model.codec.split(',').map((c) => c.trim()) : []);
}

function hasHiResCodec(model) {
  const list = toCodecList(model);
  return list.some((c) => ['ldac', 'aptx'].some((h) => String(c).toLowerCase().includes(h)));
}

// aptX Low Latency-class codec — the signal that matters for lip-sync when
// watching video over Bluetooth (plain aptX/LDAC do not guarantee low
// latency by themselves).
function hasLowLatencyCodec(model) {
  const list = toCodecList(model);
  return list.some((c) => String(c).toLowerCase().includes('low latency') || String(c).toLowerCase().includes('ll'));
}

// `type` is a free-text optional DATA V1 field (see schema.sql) — not every
// row has it populated, so this is a best-effort substring match.
function isOpenEarType(model) {
  return String(model.type || '').toLowerCase().includes('open');
}

export const NAMED_FILTERS = { hasHiResCodec, hasLowLatencyCodec, isOpenEarType };
export const NAMED_COMPUTED = { hasHiResCodec, hasLowLatencyCodec, isOpenEarType };

function evalClause(model, clause) {
  if (clause.named) {
    const fn = NAMED_FILTERS[clause.named];
    return fn ? Boolean(fn(model)) : false;
  }
  const { field, op, value } = clause;
  const raw = getField(model, field);

  switch (op) {
    case 'eq':
      return String(raw) === String(value) || raw === value;
    case 'in':
      return Array.isArray(value) && value.some((v) => String(raw) === String(v));
    case 'lte': {
      const n = Number(raw);
      return Number.isFinite(n) && n <= Number(value);
    }
    case 'lt': {
      const n = Number(raw);
      return Number.isFinite(n) && n < Number(value);
    }
    case 'gte': {
      const n = Number(raw);
      return Number.isFinite(n) && n >= Number(value);
    }
    case 'gt': {
      const n = Number(raw);
      return Number.isFinite(n) && n > Number(value);
    }
    case 'between': {
      const [min, max] = value;
      return raw != null && raw >= min && raw < max;
    }
    case 'contains':
      return String(raw || '').toLowerCase().includes(String(value).toLowerCase());
    case 'regex':
      return new RegExp(value, clause.flags || '').test(String(raw || ''));
    default:
      return true;
  }
}

/** filterConfig: null | { clauses: [...] } — clauses are AND'd. */
export function applyFilter(models, filterConfig) {
  if (!filterConfig || !Array.isArray(filterConfig.clauses) || filterConfig.clauses.length === 0) {
    return models;
  }
  return models.filter((m) => filterConfig.clauses.every((clause) => evalClause(m, clause)));
}

function compareOne(a, b, rule) {
  let av;
  let bv;
  if (rule.computed) {
    const fn = NAMED_COMPUTED[rule.computed];
    av = fn ? Number(Boolean(fn(a))) : 0;
    bv = fn ? Number(Boolean(fn(b))) : 0;
  } else if (rule.type === 'date') {
    av = new Date(getField(a, rule.field) || 0).getTime();
    bv = new Date(getField(b, rule.field) || 0).getTime();
  } else if (rule.type === 'string') {
    av = String(getField(a, rule.field) || '');
    bv = String(getField(b, rule.field) || '');
    const cmp = bv.localeCompare(av);
    return rule.direction === 'asc' ? -cmp : cmp;
  } else {
    // number (also used for booleans: true -> 1, false -> 0)
    av = Number(getField(a, rule.field)) || 0;
    bv = Number(getField(b, rule.field)) || 0;
  }
  const diff = bv - av;
  return rule.direction === 'asc' ? -diff : diff;
}

/** sortConfig: [ {field,type,direction} | {computed,direction}, ... ] — first non-zero wins. */
export function applySort(models, sortConfig) {
  if (!Array.isArray(sortConfig) || sortConfig.length === 0) return models;
  return [...models].sort((a, b) => {
    for (const rule of sortConfig) {
      const result = compareOne(a, b, rule);
      if (result !== 0) return result;
    }
    return 0;
  });
}
