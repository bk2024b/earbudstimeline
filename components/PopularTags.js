import Link from 'next/link';

export default function PopularTags({ topModels, commonBt }) {
  const tags = [
    ...topModels.slice(0, 2).map((m) => ({ label: m.name, href: `/ecouteurs/${m.id}` })),
    { label: 'ANC', href: '/?anc=yes#timeline' },
    ...(commonBt ? [{ label: `Bluetooth ${commonBt}`, href: `/?bt=${commonBt}#timeline` }] : []),
  ];

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs mb-8">
      <span className="text-dim shrink-0">Populaires :</span>
      {tags.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className="bg-panel2 border border-line rounded-full px-3 py-1 hover:border-accent hover:text-accent transition-colors"
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
