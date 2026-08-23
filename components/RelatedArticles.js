import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Clock, ArrowRight } from 'lucide-react';

export default async function RelatedArticles({ articles = [], locale = 'fr' }) {
  if (!articles || articles.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'related' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="mt-12 pt-8 border-t border-line">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-fg">
          {t('articles') || 'Articles similaires recommandés'}
        </h3>
        <Link
          href="/blog"
          className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
        >
          <span>{locale === 'en' ? 'All articles' : 'Tout le blog'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="group flex flex-col bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent/60 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <div className="relative aspect-[16/10] w-full bg-panel2 overflow-hidden">
              {a.cover_image_url ? (
                <Image
                  src={a.cover_image_url}
                  alt={a.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                  🎧
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col justify-between flex-1 gap-2">
              <h4 className="font-display font-semibold text-sm text-fg group-hover:text-accent transition-colors leading-snug line-clamp-2 m-0">
                {a.title}
              </h4>
              <p className="m-0 text-dim text-xs font-mono flex items-center gap-1 mt-auto">
                <Clock className="w-3 h-3 text-dim/70" />
                <span>{a.reading_minutes} {tc('minutesRead')}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
