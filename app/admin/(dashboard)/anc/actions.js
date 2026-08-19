'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { redirect } from 'next/navigation';

const nullable = (v) => {
  const s = v?.toString().trim();
  return s ? s : null;
};

function evidenceData(formData) {
  return {
    earbud_id: formData.get('earbud_id')?.toString().trim(),
    metric: formData.get('metric')?.toString().trim() || 'anc',
    value: nullable(formData.get('value')),
    measurement_type: nullable(formData.get('measurement_type')),
    measurement_context: nullable(formData.get('measurement_context')),
    noise_category: nullable(formData.get('noise_category')),
    source_url: nullable(formData.get('source_url')),
    source_name: nullable(formData.get('source_name')),
    source_type: nullable(formData.get('source_type')),
    confidence: nullable(formData.get('confidence')),
    notes: nullable(formData.get('notes')),
  };
}

function revalidateAnc(earbudId) {
  revalidatePath('/admin/anc');
  revalidatePath(`/admin/anc/${earbudId}`);
  revalidatePath('/admin/anc/import');
}

export async function saveAncEvidence(formData) {
  const data = evidenceData(formData);
  const evidenceId = formData.get('evidence_id')?.toString().trim();
  if (!data.earbud_id || !data.value || !data.source_url || !data.noise_category) {
    redirect(`/admin/anc/${data.earbud_id}?error=missing`);
  }

  const supabase = getSupabaseAdmin();
  let error;
  if (evidenceId) {
    ({ error } = await supabase.from('earbuds_evidence').update(data).eq('id', Number(evidenceId)));
  } else {
    ({ error } = await supabase.from('earbuds_evidence').insert(data));
  }

  if (error) redirect(`/admin/anc/${data.earbud_id}?error=${encodeURIComponent(error.message)}`);
  revalidateAnc(data.earbud_id);
  redirect(`/admin/anc/${data.earbud_id}?saved=1`);
}

export async function deleteAncEvidence(evidenceId, earbudId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('earbuds_evidence').delete().eq('id', Number(evidenceId));
  if (error) redirect(`/admin/anc/${earbudId}?error=${encodeURIComponent(error.message)}`);
  revalidateAnc(earbudId);
  redirect(`/admin/anc/${earbudId}?saved=1`);
}

// CSV import resolves earbuds by their human-readable model name.
// Internal database IDs never need to appear in the CSV.
const SOURCE_TYPE_ALIASES = {
  review: 'editorial_test',
  editorial: 'editorial_test',
  editorial_test: 'editorial_test',
  laboratory: 'laboratory',
  lab: 'laboratory',
  manufacturer: 'manufacturer',
  community: 'community',
  aggregated: 'aggregated',
  official: 'official',
};

function normalizeSourceType(value) {
  const raw = value?.toString().trim().toLowerCase();
  return raw ? (SOURCE_TYPE_ALIASES[raw] || raw) : null;
}

export async function importAncEvidenceCsv(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const supabase = getSupabaseAdmin();
  const results = [];

  // Resolve all names in one query instead of one query per CSV row.
  const names = [...new Set(rows.map((r) => r.earbud_name?.toString().trim()).filter(Boolean))];
  const { data: earbuds, error: lookupError } = names.length
    ? await supabase.from('earbuds').select('id,name').in('name', names)
    : { data: [], error: null };

  if (lookupError) {
    return rows.map((raw) => ({
      ok: false,
      earbud_name: raw.earbud_name?.toString().trim() || '?',
      error: `Impossible de résoudre les modèles : ${lookupError.message}`,
    }));
  }

  const byName = new Map((earbuds || []).map((e) => [e.name.trim().toLowerCase(), e]));

  for (const raw of rows) {
    const earbudName = raw.earbud_name?.toString().trim();
    const value = raw.value?.toString().trim();
    const sourceUrl = raw.source_url?.toString().trim();
    const noiseCategory = raw.noise_category?.toString().trim();

    if (!earbudName || !value || !sourceUrl || !noiseCategory) {
      results.push({ ok: false, earbud_name: earbudName || '?', error: 'earbud_name, value, source_url et noise_category sont obligatoires' });
      continue;
    }

    const earbud = byName.get(earbudName.toLowerCase());
    if (!earbud) {
      results.push({ ok: false, earbud_name: earbudName, error: 'Modèle introuvable dans la base' });
      continue;
    }

    const data = {
      earbud_id: earbud.id,
      metric: raw.metric?.toString().trim() || 'anc',
      value,
      measurement_type: nullable(raw.measurement_type),
      measurement_context: nullable(raw.measurement_context),
      noise_category: noiseCategory,
      source_url: sourceUrl,
      source_name: nullable(raw.source_name),
      source_type: normalizeSourceType(raw.source_type),
      confidence: nullable(raw.confidence),
      notes: nullable(raw.notes),
    };

    try {
      const evidenceId = raw.evidence_id?.toString().trim();
      let error;
      if (evidenceId) {
        ({ error } = await supabase.from('earbuds_evidence').update(data).eq('id', Number(evidenceId)));
      } else {
        ({ error } = await supabase.from('earbuds_evidence').insert(data));
      }
      if (error) throw error;
      results.push({ ok: true, earbud_name: earbudName, earbud_id: earbud.id, evidence_id: evidenceId || null });
    } catch (e) {
      results.push({ ok: false, earbud_name: earbudName, earbud_id: earbud.id, error: e.message });
    }
  }

  revalidatePath('/admin/anc');
  revalidatePath('/admin/anc/import');
  return results;
}
