'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function SearchBar({ models, brands }) {
  const t = useTranslations('searchBar');
  const [q, setQ] = useState('');
  const router = useRouter();
  const brandName = (id) => brands.find((b) => b.id === id)?.name || id;

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return models
      .filter((m) => `${m.name} ${brandName(m.brand_id)} ${m.gamme}`.toLowerCase().includes(term))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, models]);

  return (
    <div className="relative max-w-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) router.push(`/ecouteurs/${results[0].id}`);
        }}
        className="flex items-center gap-2 bg-panel2 border border-line rounded-full pl-4 pr-1.5 py-1.5"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-dim"
        />
        <button
          type="submit"
          aria-label={t('ariaLabel')}
          className="bg-accent text-ink rounded-full w-8 h-8 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {results.length > 0 && (
        <div className="absolute mt-2 w-full bg-panel border border-line rounded-xl overflow-hidden z-30 shadow-xl">
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/ecouteurs/${m.id}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-panel2 text-sm border-b border-line last:border-b-0"
              onClick={() => setQ('')}
            >
              <span>{m.name}</span>
              <span className="text-dim text-xs">{brandName(m.brand_id)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
