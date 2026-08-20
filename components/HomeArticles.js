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
        <h2 className="text-[15px] m-0">{t('featured')}</h2>
        <Link href="/blog" className="text-xs text-accent hover:underline">
          {t('seeAllArticles')}
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="flex items-center gap-3.5 bg-panel border border-line rounded-xl p-3 hover:border-accent transition-colors"
          >
            <div className="relative w-16 h-16 rounded-lg bg-panel2 shrink-0 overflow-hidden">
              {a.cover_image_url && (
                <Image src={a.cover_image_url} alt="" fill sizes="64px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[13.5px] font-medium truncate">{a.title}</p>
              <p className="m-0 text-dim text-[11px] mt-0.5">
                {fmtPublished(a.published_at, locale)} · {a.reading_minutes} {tc('minutesRead')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
