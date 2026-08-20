'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendNewsletterBatches } from '@/lib/newsletterSend';

export async function getNewsletters() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function getSubscriberCount() {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null);
  return count || 0;
}

export async function sendNewsletter(formData) {
  const subject = formData.get('subject')?.toString().trim() || '';
  const content_html = formData.get('content_html')?.toString() || '';

  if (!subject || !content_html) {
    redirect('/admin/newsletter/new?error=missing');
  }

  const supabase = getSupabaseAdmin();

  // Enregistre le brouillon d'abord — même si l'envoi échoue ensuite, on garde
  // une trace de ce qui a été rédigé plutôt que de le perdre.
  const { data: newsletter, error: insertError } = await supabase
    .from('newsletters')
    .insert({ subject, content_html, status: 'sending' })
    .select()
    .single();

  if (insertError) {
    redirect('/admin/newsletter/new?error=db');
  }

  const { data: subscribers, error: subError } = await supabase
    .from('newsletter_subscribers')
    .select('email, locale, unsubscribe_token')
    .is('unsubscribed_at', null);

  if (subError || !subscribers || subscribers.length === 0) {
    await supabase.from('newsletters').update({ status: 'failed' }).eq('id', newsletter.id);
    redirect('/admin/newsletter/new?error=no_subscribers');
  }

  let result;
  try {
    result = await sendNewsletterBatches({ subject, html: content_html, subscribers });
  } catch (e) {
    // Le plus souvent : clé Resend absente (compte pas encore configuré).
    await supabase.from('newsletters').update({ status: 'failed' }).eq('id', newsletter.id);
    redirect(`/admin/newsletter/new?error=${encodeURIComponent(e.message)}`);
  }

  await supabase
    .from('newsletters')
    .update({
      status: result.failed === 0 ? 'sent' : result.sent > 0 ? 'sent' : 'failed',
      recipient_count: result.sent,
      failed_count: result.failed,
      sent_at: new Date().toISOString(),
    })
    .eq('id', newsletter.id);

  revalidatePath('/admin/newsletter');
  redirect('/admin/newsletter');
}
