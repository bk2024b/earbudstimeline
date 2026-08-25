import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { getPublishedArticles } from '@/lib/queries';
import { canonicalFor } from '@/lib/seo';
import FeaturedArticle from '@/components/FeaturedArticle';
import BlogSidebar from '@/components/BlogSidebar';
import { Footer } from '@/components/UI';
import { Sparkles, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const isEn = locale === 'en';
  const title = isEn
    ? 'Earbuds Blog — News, Guides & Head-to-Head Comparisons | EarbudsTimeline'
    : 'Blog Écouteurs — Actualités, Guides et Analyses Comparatives | EarbudsTimeline';
  const description = isEn
    ? 'Discover in-depth analysis, buying guides, ANC testing breakdowns, and technology timelines on wireless earbuds.'
    : 'Découvrez nos analyses approfondies, guides d’achat, décryptages ANC et dossiers technologiques sur les écouteurs sans fil.';

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/blog`),
    openGraph: {
      title,
      description,
    },
  };
}

function fmtPublished(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
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

  const featured = articles[0] || null;
  const restArticles = articles.slice(1);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Header du Blog */}
      <div className="text-center max-w-3xl mx-auto pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{locale === 'en' ? 'Editorial & Tech Insights' : 'Le Média Tech Écouteurs'}</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight mb-4 text-fg">
          {t('title')}{' '}
          <span className="text-accent">{locale === 'en' ? '& Analyses' : '& Décryptages'}</span>
        </h1>
        <p className="text-sm sm:text-base text-dim leading-relaxed max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {articles.length === 0 && (
        <div className="bg-panel border border-dashed border-line rounded-2xl p-12 text-center text-dim">
          {t('empty')}
        </div>
      )}

      {articles.length > 0 && (
        <div>
          {/* Article en vedette */}
          {featured && <FeaturedArticle article={featured} locale={locale} />}

          {/* Grille des articles + Barre latérale */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Grille principale des articles */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-line/60">
                <h2 className="font-display font-bold text-xl text-fg">
                  {locale === 'en' ? 'Recent Articles' : 'Dernières publications'} ({articles.length})
                </h2>
              </div>

              {restArticles.length === 0 ? (
                <div className="text-dim text-sm py-4">
                  {locale === 'en' ? 'More articles coming soon.' : 'D’autres articles arrivent très prochainement.'}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {restArticles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/blog/${a.id}`}
                      className="group flex flex-col bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent/60 transition-all duration-300 shadow-lg hover:shadow-2xl flex-1"
                    >
                      {/* Image de couverture */}
                      <div className="relative aspect-[16/9] w-full bg-panel2 overflow-hidden">
                        {a.cover_image_url ? (
                          <Image
                            src={a.cover_image_url}
                            alt={a.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                            🎧
                          </div>
                        )}
                      </div>

                      {/* Corps de la carte */}
                      <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-display font-bold text-lg text-fg group-hover:text-accent transition-colors leading-snug">
                            {a.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-dim line-clamp-2 leading-relaxed">
                            {a.excerpt}
                          </p>
                        </div>

                        {/* Méta-données */}
                        <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs text-dim font-mono mt-auto">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-dim/70" />
                            <span>{fmtPublished(a.published_at, locale)}</span>
                          </span>
                          <span className="flex items-center gap-1 text-accent font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{a.reading_minutes} {tc('minutesRead')}</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar éditoriale */}
            <BlogSidebar articles={articles} locale={locale} excludeId={featured?.id} />
          </div>
        </div>
      )}

      <Footer locale={locale} />
    </div>
  );
}
