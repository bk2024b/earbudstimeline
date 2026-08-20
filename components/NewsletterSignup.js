'use client';

import { useState } from 'react';

export default function NewsletterSignup({ locale, title, subtitle, placeholder, cta, successMessage }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl bg-panel border border-line p-5">
      <p className="text-sm font-semibold m-0">{title}</p>
      <p className="text-xs text-dim mt-1 mb-3">{subtitle}</p>

      {status === 'success' ? (
        <p className="text-sm text-accent m-0">{successMessage}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 bg-accent text-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {cta}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2 m-0">
          {locale === 'en' ? 'Something went wrong — try again?' : "Un souci est survenu — réessaie ?"}
        </p>
      )}
    </div>
  );
}
