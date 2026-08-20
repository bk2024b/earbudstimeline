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

export default async function FeaturedArticle({ article, locale }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <Link
      href={`/blog/${article.id}`}
      className="group grid sm:grid-cols-2 gap-0 bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent transition-colors mb-8"
    >
      <div className="relative aspect-video sm:aspect-auto bg-panel2">
        {article.cover_image_url && (
          <Image
            src={article.cover_image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-6 flex flex-col justify-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.1em] text-accent font-medium">
          {t('featuredBadge')}
        </span>
        <h2 className="font-display font-bold text-xl sm:text-2xl leading-snug group-hover:text-accent transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-dim line-clamp-3">{article.excerpt}</p>
        <p className="text-xs text-dim">
          {fmtPublished(article.published_at, locale)} · {article.reading_minutes} {tc('minutesRead')}
        </p>
      </div>
    </Link>
  );
}
