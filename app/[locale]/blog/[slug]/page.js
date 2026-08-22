import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import sanitizeHtml from 'sanitize-html';
import { getArticleBySlug, getArticleTranslation, getBrands, getPublishedArticles } from '@/lib/queries';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, JsonLd, absoluteUrl } from '@/lib/seo';
import { findRelatedArticles } from '@/lib/relatedArticles';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ShareButtons from '@/components/ShareButtons';
import DonateButton from '@/components/DonateButton';
import BlogSidebar from '@/components/BlogSidebar';
import RelatedArticles from '@/components/RelatedArticles';
import TableOfContents from '@/components/TableOfContents';
import ArticleSummary from '@/components/ArticleSummary';

export const dynamic = 'force-dynamic';

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
      // id : requis pour que les ancres de la table des matières (#slug-du-titre)
      // pointent vers un heading existant dans le HTML rendu.
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'class'],
      table: ['class'],
      th: ['class', 'colspan', 'rowspan', 'style', 'scope'],
      td: ['class', 'colspan', 'rowspan', 'style'],
      div: ['class'],
    },
  });

  const [t, tc, td, ts, allArticles] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'donate' }),
    getTranslations({ locale, namespace: 'share' }),
    getPublishedArticles(locale).catch(() => []),
  ]);

  let mentionedBrand = null;
  try {
    const brands = await getBrands();
    const haystack = `${article.title} ${article.excerpt}`.toLowerCase();
    mentionedBrand = brands.find((b) => haystack.includes(b.name.toLowerCase())) || null;
  } catch {
    // pas bloquant : la page s'affiche sans le lien "Tous les X" si ça échoue
  }

  // "Lecture liée" : même logique de rattachement que sur les pages produit —
  // matching par marque mentionnée, pas de tagging manuel requis.
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
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <article className="min-w-0">
          <div>
            <JsonLd data={buildArticleJsonLd(article, locale)} />
            <JsonLd
              data={buildBreadcrumbJsonLd([
                { name: homeLabel, url: '/' },
                { name: 'Blog', url: '/blog' },
                { name: article.title, url: `/blog/${article.id}` },
              ], locale)}
            />
            <Link href="/blog" className="text-xs text-dim hover:text-accent">
              {t('backToBlog')}
            </Link>
            {translation && (
              <Link
                href={`/blog/${translation.id}`}
                locale={translation.locale}
                className="ml-3 text-xs text-accent hover:underline"
              >
                {t('availableIn', { lang: langNames[translation.locale] })}
              </Link>
            )}

            <h1 className="font-display font-bold text-3xl sm:text-4xl mt-4 mb-2">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-dim text-sm m-0">
                {fmtPublished(article.published_at, locale)} · {article.reading_minutes} {tc('minutesRead')}
              </p>
              <ShareButtons url={shareUrl} title={article.title} />
            </div>

            {article.cover_image_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-panel2 mb-8">
                <Image
                  src={article.cover_image_url}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* TOC (colonne sticky en xl+, bloc repliable en dessous) + corps de l'article.
              Un seul <TableOfContents> gère les deux rendus, voir le composant. */}
          <div className="xl:grid xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-10 items-start">
            <TableOfContents items={toc} title={t('tableOfContents')} mobileTitle={t('tableOfContents')} />

            <div className="min-w-0">
              <ArticleSummary text={article.excerpt} label={t('inBrief')} />

              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />

              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-line">
                {mentionedBrand && (
                  <Link
                    href={`/marques/${mentionedBrand.id}`}
                    className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
                  >
                    {t('allX', { brand: mentionedBrand.name })}
                  </Link>
                )}
                <Link
                  href="/technologies"
                  className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
                >
                  {t('exploreByTech')}
                </Link>
                <Link
                  href="/comparaisons"
                  className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
                >
                  {t('seeComparisons')}
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 p-5 rounded-2xl bg-panel border border-line">
                <p className="text-sm text-dim m-0">{td('subtitle')}</p>
                <div className="flex items-center gap-4 shrink-0">
                  <ShareButtons url={shareUrl} title={article.title} label={ts('label')} />
                  <DonateButton label={td('cta')} />
                </div>
              </div>

              <RelatedArticles articles={relatedArticles} locale={locale} />
            </div>
          </div>
        </article>

        <BlogSidebar articles={allArticles} locale={locale} excludeId={article.id} />
      </div>
    </>
  );
}
