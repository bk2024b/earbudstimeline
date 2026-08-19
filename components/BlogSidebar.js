import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function BlogSidebar({ articles, locale, excludeId }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const list = articles.filter((a) => a.id !== excludeId).slice(0, 6);
  if (list.length === 0) return null;

  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-[0.1em] text-dim">{t('latestArticles')}</h2>
      <div className="flex flex-col gap-3">
        {list.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="flex items-center gap-3 bg-panel border border-line rounded-xl p-3 hover:border-accent transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-panel2 shrink-0 overflow-hidden">
              {a.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-medium leading-snug line-clamp-2">{a.title}</p>
              <p className="m-0 text-dim text-[11px] mt-1">
                {a.reading_minutes} {tc('minutesRead')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
