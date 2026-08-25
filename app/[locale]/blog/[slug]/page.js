import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import sanitizeHtml from 'sanitize-html';
import {
  getArticleBySlug,
  getArticleTranslation,
  getBrands,
  getAllEarbuds,
  getPublishedArticles,
  getAllPublishedArticles,
} from '@/lib/queries';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, JsonLd, absoluteUrl } from '@/lib/seo';
import { findRelatedArticles } from '@/lib/relatedArticles';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ShareButtons from '@/components/ShareButtons';
import DonateButton from '@/components/DonateButton';
import RelatedArticles from '@/components/RelatedArticles';
import TableOfContents from '@/components/TableOfContents';
import ArticleSummary from '@/components/ArticleSummary';
import ArticleProductCard from '@/components/ArticleProductCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Footer } from '@/components/UI';
import { Calendar, Clock, ArrowLeft, Globe, Share2, Sparkles, BookOpen } from 'lucide-react';

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const articles = await getAllPublishedArticles();
    return articles.map((a) => ({ locale: a.locale, slug: a.id }));
  } catch {
    return [];
  }
}

function fmtPublished(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  try {
    const article = await getArticleBySlug(slug);
    const translation = await getArticleTranslation(article).catch(() => null);
    const languages = { [locale]: `/${locale}/blog/${article.id}` };
    if (translation) languages[translation.locale] = `/${translation.locale}/blog/${translation.id}`;

    return {
      title: `${article.title} — EarbudsTimeline`,
      description: article.excerpt,
      alternates: { canonical: `/${locale}/blog/${article.id}`, languages },
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: article.cover_image_url ? [article.cover_image_url] : undefined,
      },
    };
  } catch {
    return { title: 'Article — EarbudsTimeline' };
  }
}

export default async function ArticlePage({ params }) {
  const { locale, slug } = params;
  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }
  if (!article) notFound();

  const safeHtml = sanitizeHtml(article.content_html || '', {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'strong', 'em', 's', 'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'br', 'code', 'pre', 'hr',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'div',
    ],
    allowedAttributes: {
      h2: ['id'], h3: ['id'], h4: ['id'],
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'class'],
      table: ['class'],
      th: ['class', 'colspan', 'rowspan', 'style', 'scope'],
      td: ['class', 'colspan', 'rowspan', 'style'],
      div: ['class'],
    },
  });

  const [t, tc, td, ts, tn, allArticles, allEarbuds, brands] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'donate' }),
    getTranslations({ locale, namespace: 'share' }),
    getTranslations({ locale, namespace: 'newsletter' }),
    getPublishedArticles(locale).catch(() => []),
    getAllEarbuds().catch(() => []),
    getBrands().catch(() => []),
  ]);

  // Détecte intelligemment si l'article mentionne un modèle d'écouteur ou une marque
  const textHaystack = `${article.title} ${article.excerpt} ${article.content_html || ''}`.toLowerCase();
  const mentionedModel = allEarbuds.find((m) => m.name && textHaystack.includes(m.name.toLowerCase())) || null;
  const mentionedBrand = brands.find((b) =>
    mentionedModel ? b.id === mentionedModel.brand_id : textHaystack.includes(b.name.toLowerCase())
  ) || null;

  const otherArticles = allArticles.filter((a) => a.id !== article.id);
  const relatedArticles = mentionedBrand
    ? findRelatedArticles(otherArticles, [mentionedBrand.name], 3)
    : otherArticles.slice(0, 3);

  const shareUrl = absoluteUrl(`/blog/${article.id}`, locale);
  const translation = await getArticleTranslation(article).catch(() => null);
  const langNames = { en: 'English', fr: 'Français' };
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const toc = Array.isArray(article.table_of_contents) ? article.table_of_contents : [];

  return (
    <>
      <ReadingProgressBar />

      <div className="blog-article-layout">
        <article className="blog-article-main min-w-0">
          <JsonLd data={buildArticleJsonLd(article, locale)} />
          <JsonLd
            data={buildBreadcrumbJsonLd([
              { name: homeLabel, url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: article.title, url: `/blog/${article.id}` },
            ], locale)}
          />

          {/* Barre supérieure : retour et bascule de traduction */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-accent font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('backToBlog')}</span>
            </Link>

            {translation && (
              <Link
                href={`/blog/${translation.id}`}
                locale={translation.locale}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline bg-accent/10 border border-accent/30 rounded-full px-3 py-1 font-mono"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('availableIn', { lang: langNames[translation.locale] })}</span>
              </Link>
            )}
          </div>

          {/* En-tête de l'article */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-3">
              <BookOpen className="w-3 h-3" />
              <span>{locale === 'en' ? 'Article & Insights' : 'Dossier Tech'}</span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[42px] leading-[1.18] text-fg mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line/60">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-dim font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-dim/70" />
                  <span>{fmtPublished(article.published_at, locale)}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_minutes} {tc('minutesRead')}</span>
                </span>
              </div>

              <ShareButtons url={shareUrl} title={article.title} />
            </div>
          </div>

          {/* Image de couverture principale */}
          {article.cover_image_url && (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-panel2 mb-8 shadow-2xl border border-line">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          )}

          {/* Mobile/tablette : Table des matières repliable */}
          <div className="blog-article-toc-mobile mb-6">
            <TableOfContents
              items={toc}
              title={t('tableOfContents') || 'Sommaire'}
              mobileTitle={t('tableOfContents') || 'Dans cet article (Sommaire)'}
            />
          </div>

          {/* Résumé "En bref" */}
          <ArticleSummary text={article.excerpt} label={t('inBrief') || 'En Bref'} />

          {/* Corps de l'article riche */}
          <div
            className="prose max-w-none w-full leading-relaxed text-[15.5px] sm:text-base"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {/* Mini fiche produit intégrée si un écouteur est mentionné */}
          {mentionedModel && (
            <ArticleProductCard
              model={mentionedModel}
              brand={mentionedBrand}
              locale={locale}
            />
          )}

          {/* Tags et liens de rebond */}
          <div className="flex flex-wrap gap-2.5 mt-10 pt-6 border-t border-line">
            {mentionedBrand && (
              <Link
                href={`/marques/${mentionedBrand.id}`}
                className="px-4 py-2 rounded-full border border-line bg-panel2 text-dim text-xs hover:border-accent hover:text-accent transition-colors font-medium"
              >
                {t('allX', { brand: mentionedBrand.name })}
              </Link>
            )}
            <Link
              href="/technologies"
              className="px-4 py-2 rounded-full border border-line bg-panel2 text-dim text-xs hover:border-accent hover:text-accent transition-colors font-medium"
            >
              {t('exploreByTech')}
            </Link>
            <Link
              href="/comparaisons"
              className="px-4 py-2 rounded-full border border-line bg-panel2 text-dim text-xs hover:border-accent hover:text-accent transition-colors font-medium"
            >
              {t('seeComparisons')}
            </Link>
          </div>

          {/* Encart Partage & Soutien */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-10 p-6 rounded-2xl bg-panel border border-line shadow-xl">
            <div>
              <div className="font-display font-semibold text-base text-fg mb-1">
                {locale === 'en' ? 'Found this article helpful?' : 'Cet article vous a été utile ?'}
              </div>
              <p className="text-xs sm:text-sm text-dim m-0 max-w-md">
                {td('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ShareButtons url={shareUrl} title={article.title} label={ts('label')} />
              <DonateButton label={td('cta')} />
            </div>
          </div>

          {/* Formulaire Newsletter */}
          <div className="mt-10 mb-4">
            <NewsletterSignup
              locale={locale}
              title={tn('title')}
              subtitle={tn('subtitle')}
              placeholder={tn('placeholder')}
              cta={tn('cta')}
              successMessage={tn('success')}
            />
          </div>

          {/* Articles similaires */}
          <RelatedArticles articles={relatedArticles} locale={locale} />
        </article>

        {/* Desktop : Colonne latérale Table des matières sticky */}
        <aside className="blog-article-toc-desktop">
          <TableOfContents
            items={toc}
            title={t('tableOfContents') || 'Sommaire'}
            mobileTitle={t('tableOfContents') || 'Sommaire'}
          />

          {/* Mini-fiche produit latérale si disponible */}
          {mentionedModel && (
            <div className="mt-8 p-4 rounded-2xl bg-panel border border-line/80 shadow-lg">
              <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2">
                {locale === 'en' ? 'Featured Model' : 'Modèle Cité'}
              </div>
              <h4 className="font-display font-semibold text-sm text-fg mb-3 line-clamp-1">
                {mentionedModel.name}
              </h4>
              {mentionedModel.buy_url && (
                <a
                  href={mentionedModel.buy_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full bg-accent text-ink font-bold rounded-xl px-3 py-2 text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
                >
                  <span>{locale === 'en' ? 'Check Price' : "Voir l'offre"}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              )}
            </div>
          )}
        </aside>
      </div>

      <Footer locale={locale} />
    </>
  );
}
