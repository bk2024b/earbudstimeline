import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import sanitizeHtml from 'sanitize-html';
import { getArticleBySlug, getArticleTranslation, getBrands } from '@/lib/queries';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

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
    allowedTags: ['h2', 'h3', 'p', 'strong', 'em', 's', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'br', 'code', 'pre'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'class'],
    },
  });

  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  let mentionedBrand = null;
  try {
    const brands = await getBrands();
    const haystack = `${article.title} ${article.excerpt}`.toLowerCase();
    mentionedBrand = brands.find((b) => haystack.includes(b.name.toLowerCase())) || null;
  } catch {
    // pas bloquant : la page s'affiche sans le lien "Tous les X" si ça échoue
  }

  const translation = await getArticleTranslation(article).catch(() => null);
  const langNames = { en: 'English', fr: 'Français' };

  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <article>
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
      <p className="text-dim text-sm mb-6">
        {fmtPublished(article.published_at, locale)} · {article.reading_minutes} {tc('minutesRead')}
      </p>

      {article.cover_image_url && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-panel2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />

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
    </article>
  );
}
