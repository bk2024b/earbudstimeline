import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

function fmtPublished(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function HomeArticles({ articles, locale }) {
  if (articles.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="path-indicator text-accent text-[11px]">{t('featured')}</div>
        <Link href="/blog" className="text-xs text-accent hover:underline font-mono">
          {t('seeAllArticles')} →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="hardware-card group flex items-center gap-3.5 bg-panel p-3"
          >
            <div className="relative w-16 h-16 rounded-base bg-panel2 shrink-0 overflow-hidden">
              {a.cover_image_url && (
                <Image src={a.cover_image_url} alt="" fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-fg group-hover:text-accent transition-colors truncate">{a.title}</p>
              <p className="m-0 text-dim text-[11px] font-mono mt-1">
                {fmtPublished(a.published_at, locale)} · {a.reading_minutes} {tc('minutesRead')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
