import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function htmlPage(message) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>EarbudsTimeline</title>
    <style>body{font-family:system-ui,sans-serif;background:#0A0A0B;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
    p{max-width:420px;text-align:center;padding:0 20px}</style></head>
    <body><p>${message}</p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = searchParams.get('token');

  if (!email || !token) {
    return htmlPage('Lien de désabonnement invalide.');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email)
    .eq('unsubscribe_token', token)
    .select()
    .single();

  if (error || !data) {
    return htmlPage('Ce lien de désabonnement est invalide ou a déjà été utilisé.');
  }

  return htmlPage('Tu as bien été désabonné·e de la newsletter EarbudsTimeline. Pas de rancune !');
}
