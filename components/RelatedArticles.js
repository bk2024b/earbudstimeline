import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function RelatedArticles({ articles, locale }) {
  if (articles.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'related' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="mb-12">
      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('articles')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="bg-panel border border-line rounded-xl p-4 hover:border-accent transition-colors"
          >
            <p className="m-0 text-[13.5px] font-medium leading-snug">{a.title}</p>
            <p className="m-0 text-dim text-[11px] mt-1.5">
              {a.reading_minutes} {tc('minutesRead')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
