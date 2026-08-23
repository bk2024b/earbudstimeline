import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Sparkles, Clock, Calendar, ArrowRight } from 'lucide-react';

function fmtPublished(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function FeaturedArticle({ article, locale }) {
  if (!article) return null;

  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <Link
      href={`/blog/${article.id}`}
      className="group relative block w-full rounded-3xl overflow-hidden border border-line hover:border-accent/60 transition-all duration-300 shadow-2xl bg-panel mb-10"
    >
      <div className="grid lg:grid-cols-12 min-h-[360px] sm:min-h-[420px]">
        {/* Image de couverture avec overlay */}
        <div className="relative lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-panel2 min-h-[240px]">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-panel2 to-panel text-6xl opacity-30">
              🎧
            </div>
          )}
          {/* Gradient overlay vers le contenu */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-page/90 via-page/40 to-transparent lg:hidden" />
        </div>

        {/* Contenu textuel */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 relative z-10 bg-panel/90 lg:bg-panel">
          <div className="flex flex-col gap-3">
            {/* Badge À la une */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-mono uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('featuredBadge') || 'À la Une'}</span>
              </span>
            </div>

            {/* Titre */}
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-fg group-hover:text-accent transition-colors leading-tight mt-1">
              {article.title}
            </h2>

            {/* Extrait */}
            <p className="text-sm sm:text-base text-dim line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Pied de carte : Méta + Bouton */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-line/60 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-dim font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-dim/70" />
                <span>{fmtPublished(article.published_at, locale)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>{article.reading_minutes} {tc('minutesRead')}</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
              <span>{locale === 'en' ? 'Read full article' : "Lire l'article"}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
