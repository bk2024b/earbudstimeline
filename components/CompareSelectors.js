'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export default function CompareSelectors({ brands, models, a, b }) {
  const t = useTranslations('comparer');
  const router = useRouter();

  function update(key, value) {
    const params = new URLSearchParams();
    if (a) params.set('a', a);
    if (b) params.set('b', b);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/comparer?${params.toString()}`);
  }

  const Options = () =>
    brands.map((br) => (
      <optgroup key={br.id} label={br.name}>
        {models
          .filter((m) => m.brand_id === br.id)
          .map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
      </optgroup>
    ));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <select
        value={a || ''}
        onChange={(e) => update('a', e.target.value)}
        className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-[13.5px]"
      >
        <option value="">{t('optionA')}</option>
        <Options />
      </select>
      <select
        value={b || ''}
        onChange={(e) => update('b', e.target.value)}
        className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-[13.5px]"
      >
        <option value="">{t('optionB')}</option>
        <Options />
      </select>
    </div>
  );
}
