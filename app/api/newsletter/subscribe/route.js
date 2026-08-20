import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Textes de l'email de bienvenue (FR/EN) — volontairement simples, pas de
// template lourd. Peut être enrichi plus tard sans changer la route.
const WELCOME = {
  fr: {
    subject: 'Bienvenue sur la newsletter EarbudsTimeline',
    html: `<p>Merci de t'être inscrit·e !</p><p>Tu recevras les nouveaux articles, comparatifs et mises à jour de la base de données dès qu'ils sortent — pas de spam, pas de fréquence imposée.</p>`,
  },
  en: {
    subject: 'Welcome to the EarbudsTimeline newsletter',
    html: `<p>Thanks for subscribing!</p><p>You'll get new articles, comparisons, and database updates as soon as they're out — no spam, no forced schedule.</p>`,
  },
};

// N'échoue jamais la requête si Resend n'est pas configuré ou renvoie une
// erreur : l'inscription en base (source de vérité) doit rester le seul
// facteur qui détermine le succès pour l'utilisateur.
async function sendWelcomeEmail(email, locale) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: WELCOME[locale]?.subject || WELCOME.fr.subject,
        html: WELCOME[locale]?.html || WELCOME.fr.html,
      }),
    });
  } catch {
    // Best-effort : un échec d'envoi ne doit pas faire échouer l'inscription.
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const email = (body?.email || '').trim().toLowerCase();
  const locale = body?.locale === 'en' ? 'en' : 'fr';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, locale, unsubscribed_at: null }, { onConflict: 'email' });

  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  await sendWelcomeEmail(email, locale);

  return NextResponse.json({ ok: true });
}
