import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getPublishedArticles } from '@/lib/queries';
import { canonicalFor } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: `${t('title')} — EarbudsTimeline`,
    description: t('subtitle'),
    ...canonicalFor(`/${locale}/blog`),
  };
}

function fmtPublished(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage({ params }) {
  const { locale } = params;
  const [articles, t, tc] = await Promise.all([
    getPublishedArticles(locale),
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-2">{t('title')}</h1>
      <p className="text-dim mb-8">{t('subtitle')}</p>

      {articles.length === 0 && <p className="text-dim">{t('empty')}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent transition-colors flex flex-col"
          >
            <div className="aspect-video bg-panel2">
              {a.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h2 className="font-semibold leading-snug">{a.title}</h2>
              <p className="text-sm text-dim line-clamp-2 flex-1">{a.excerpt}</p>
              <p className="text-xs text-dim">
                {fmtPublished(a.published_at, locale)} · {a.reading_minutes} {tc('minutesRead')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
