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

export async function importAncEvidenceCsv(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const supabase = getSupabaseAdmin();
  const results = [];

  for (const raw of rows) {
    const earbudId = raw.earbud_id?.toString().trim();
    const value = raw.value?.toString().trim();
    const sourceUrl = raw.source_url?.toString().trim();
    const noiseCategory = raw.noise_category?.toString().trim();
    if (!earbudId || !value || !sourceUrl || !noiseCategory) {
      results.push({ ok: false, earbud_id: earbudId || '?', error: 'earbud_id, value, source_url et noise_category sont obligatoires' });
      continue;
    }

    const data = {
      earbud_id: earbudId,
      metric: raw.metric?.toString().trim() || 'anc',
      value,
      measurement_type: nullable(raw.measurement_type),
      measurement_context: nullable(raw.measurement_context),
      noise_category: noiseCategory,
      source_url: sourceUrl,
      source_name: nullable(raw.source_name),
      source_type: nullable(raw.source_type),
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
      results.push({ ok: true, earbud_id: earbudId, evidence_id: evidenceId || null });
    } catch (e) {
      results.push({ ok: false, earbud_id: earbudId, error: e.message });
    }
  }

  revalidatePath('/admin/anc');
  revalidatePath('/admin/anc/import');
  return results;
}
