import Link from 'next/link';
import { getNewsletters, getSubscriberCount } from './actions';

const STATUS_LABEL = {
  draft: { label: 'Brouillon', cls: 'text-dim border-line' },
  sending: { label: 'Envoi en cours…', cls: 'text-amber border-amber/40' },
  sent: { label: 'Envoyée', cls: 'text-accent border-accent/40' },
  failed: { label: 'Échec', cls: 'text-rose-400 border-rose-400/40' },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function NewsletterPage() {
  const [newsletters, subscriberCount] = await Promise.all([getNewsletters(), getSubscriberCount()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Newsletter</h1>
          <p className="text-dim text-sm mt-1">
            {subscriberCount} abonné{subscriberCount > 1 ? 's' : ''} actif{subscriberCount > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/newsletter/new"
          className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90"
        >
          + Nouvelle newsletter
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <p className="text-dim text-sm">Aucune newsletter envoyée pour l&apos;instant.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {newsletters.map((n) => {
            const s = STATUS_LABEL[n.status] || STATUS_LABEL.draft;
            return (
              <div
                key={n.id}
                className="flex items-center justify-between gap-4 bg-panel border border-line rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate m-0">{n.subject}</p>
                  <p className="text-dim text-xs mt-1 m-0">
                    {fmt(n.sent_at || n.created_at)}
                    {n.status === 'sent' && ` · ${n.recipient_count} envoyé(s)`}
                    {n.failed_count > 0 && ` · ${n.failed_count} échec(s)`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
