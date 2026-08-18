'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const STR_FIELDS = [
  'earbud_id',
  'value',
  'measurement_type',
  'measurement_context',
  'noise_category',
  'source_url',
  'source_name',
  'source_type',
  'confidence',
  'notes',
];

function text(formData, key) {
  const value = formData.get(key);
  return value == null ? null : value.toString().trim() || null;
}

function buildEvidence(formData) {
  return {
    earbud_id: text(formData, 'earbud_id'),
    metric: 'anc',
    value: text(formData, 'value'),
    measurement_type: text(formData, 'measurement_type'),
    measurement_context: text(formData, 'measurement_context'),
    noise_category: text(formData, 'noise_category'),
    source_url: text(formData, 'source_url'),
    source_name: text(formData, 'source_name'),
    source_type: text(formData, 'source_type'),
    confidence: text(formData, 'confidence'),
    notes: text(formData, 'notes'),
  };
}

function revalidateAnc() {
  revalidatePath('/admin/anc');
  revalidatePath('/admin/anc/import');
}

export async function addAncEvidence(formData) {
  const evidence = buildEvidence(formData);
  if (!evidence.earbud_id || !evidence.value || !evidence.noise_category || !evidence.source_url) {
    throw new Error('Écouteur, valeur, catégorie de bruit et URL source sont obligatoires.');
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds_evidence').insert(evidence);
  if (error) throw new Error(error.message);

  revalidateAnc();
  return { ok: true };
}

export async function deleteAncEvidence(id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds_evidence').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateAnc();
  return { ok: true };
}

function normalizeCsvRow(raw) {
  const row = {};
  for (const key of STR_FIELDS) row[key] = raw?.[key]?.toString().trim() || null;
  row.metric = 'anc';
  return row;
}

function validateEvidenceRow(raw, existingIds) {
  const row = normalizeCsvRow(raw);
  const errors = [];

  if (!row.earbud_id) errors.push('earbud_id manquant');
  else if (!existingIds.has(row.earbud_id)) errors.push('earbud_id inconnu');
  if (!row.value) errors.push('value manquant');
  if (!row.noise_category) errors.push('noise_category manquant');
  if (!row.source_url) errors.push('source_url manquant');
  if (raw?.metric && raw.metric.toString().trim().toLowerCase() !== 'anc') {
    errors.push('metric doit être anc');
  }

  return { row, errors };
}

export async function importAncEvidenceCsv(payload) {
  const rawRows = Array.isArray(payload?.rawRows) ? payload.rawRows : [];
  if (!rawRows.length) return [];

  const supabase = getSupabaseAdmin();
  const { data: earbuds, error: earbudsError } = await supabase.from('earbuds').select('id,name');
  if (earbudsError) throw new Error(earbudsError.message);

  const existingIds = new Set((earbuds || []).map((e) => e.id));
  const names = new Map((earbuds || []).map((e) => [e.id, e.name]));
  const results = [];

  for (const raw of rawRows) {
    const { row, errors } = validateEvidenceRow(raw, existingIds);
    if (errors.length) {
      results.push({ ok: false, id: row.earbud_id || '?', name: names.get(row.earbud_id) || '', error: errors.join(', ') });
      continue;
    }

    try {
      const { error } = await supabase.from('earbuds_evidence').insert(row);
      if (error) throw error;
      results.push({ ok: true, id: row.earbud_id, name: names.get(row.earbud_id) || row.earbud_id });
    } catch (e) {
      results.push({ ok: false, id: row.earbud_id, name: names.get(row.earbud_id) || row.earbud_id, error: e.message });
    }
  }

  revalidateAnc();
  return results;
}
