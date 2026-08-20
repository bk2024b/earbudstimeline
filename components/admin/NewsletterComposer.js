'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { sendNewsletter } from '@/app/admin/(dashboard)/newsletter/actions';

export default function NewsletterComposer({ subscriberCount, error }) {
  const [contentHtml, setContentHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const ERROR_MESSAGES = {
    missing: 'Le sujet et le contenu sont obligatoires.',
    db: "Erreur d'enregistrement en base — réessaie.",
    no_subscribers: 'Aucun abonné actif à qui envoyer pour le moment.',
  };

  function handleSubmit(e) {
    if (!confirming) {
      e.preventDefault();
      setConfirming(true);
      return;
    }
    setSending(true);
  }

  return (
    <form action={sendNewsletter} onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <h1 className="font-display font-bold text-2xl">Nouvelle newsletter</h1>

      {error && (
        <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {ERROR_MESSAGES[error] || `Erreur d'envoi : ${decodeURIComponent(error)}`}
        </p>
      )}

      <div>
        <label className="block text-xs text-dim mb-1.5">Sujet de l&apos;email</label>
        <input
          type="text"
          name="subject"
          required
          placeholder="Ex. : Les nouveautés du mois sur EarbudsTimeline"
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs text-dim mb-1.5">Contenu</label>
        <RichTextEditor name="content_html" value={contentHtml} onChange={setContentHtml} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={sending}
          className={`font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors disabled:opacity-50 ${
            confirming ? 'bg-rose-500 text-white hover:opacity-90' : 'bg-accent text-ink hover:opacity-90'
          }`}
        >
          {sending
            ? 'Envoi en cours…'
            : confirming
            ? `Confirmer l'envoi à ${subscriberCount} abonné${subscriberCount > 1 ? 's' : ''}`
            : 'Envoyer la newsletter'}
        </button>
        {confirming && !sending && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-dim text-sm hover:text-white"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
