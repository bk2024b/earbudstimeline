import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function PopularTags({ topModels, commonBt, locale }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  const tags = [
    ...topModels.slice(0, 2).map((m) => ({ label: m.name, href: `/ecouteurs/${m.id}` })),
    { label: 'ANC', href: '/?anc=yes#timeline' },
    ...(commonBt ? [{ label: `Bluetooth ${commonBt}`, href: `/?bt=${commonBt}#timeline` }] : []),
  ];

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs mb-8">
      <span className="text-dim shrink-0">{t('popular')}</span>
      {tags.map((tag) => (
        <Link
          key={tag.label}
          href={tag.href}
          className="bg-panel2 border border-line rounded-full px-3 py-1 hover:border-accent hover:text-accent transition-colors"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
