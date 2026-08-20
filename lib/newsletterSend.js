import { SITE_URL } from '@/lib/seo';

const BATCH_SIZE = 100; // limite de l'endpoint /emails/batch de Resend

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function withUnsubscribeFooter(html, subscriber, locale) {
  const unsubUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(
    subscriber.email
  )}&token=${subscriber.unsubscribe_token}`;
  const footer =
    locale === 'en'
      ? `<hr/><p style="font-size:12px;color:#888">You're receiving this because you subscribed on EarbudsTimeline. <a href="${unsubUrl}">Unsubscribe</a></p>`
      : `<hr/><p style="font-size:12px;color:#888">Tu reçois cet email car tu es inscrit·e sur EarbudsTimeline. <a href="${unsubUrl}">Se désabonner</a></p>`;
  return html + footer;
}

/**
 * Envoie une newsletter à une liste d'abonnés via l'API batch de Resend.
 * subscribers : lignes de newsletter_subscribers (email, locale, unsubscribe_token).
 * Retourne { sent, failed } — ne lève jamais d'exception : un échec d'envoi
 * pour un lot ne doit pas empêcher les autres lots de partir.
 */
export async function sendNewsletterBatches({ subject, html, subscribers }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error(
      'RESEND_API_KEY ou RESEND_FROM_EMAIL absent des variables d\'environnement — impossible d\'envoyer.'
    );
  }

  let sent = 0;
  let failed = 0;

  for (const group of chunk(subscribers, BATCH_SIZE)) {
    const payload = group.map((sub) => ({
      from,
      to: sub.email,
      subject,
      html: withUnsubscribeFooter(html, sub, sub.locale),
    }));

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        sent += group.length;
      } else {
        failed += group.length;
      }
    } catch {
      failed += group.length;
    }
  }

  return { sent, failed };
}
