import { notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { getArticleBySlug } from '@/lib/queries';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

function fmtPublished(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }) {
  try {
    const article = await getArticleBySlug(params.slug);
    return {
      title: `${article.title} — EarbudsTimeline`,
      description: article.excerpt,
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
  let article;
  try {
    article = await getArticleBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!article) notFound();

  const safeHtml = DOMPurify.sanitize(article.content_html || '');

  return (
    <article>
      <JsonLd data={buildArticleJsonLd(article)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: article.title, url: `/blog/${article.id}` },
        ])}
      />
      <Link href="/blog" className="text-xs text-dim hover:text-accent">
        ← Retour au blog
      </Link>

      <h1 className="font-display font-bold text-3xl sm:text-4xl mt-4 mb-2">{article.title}</h1>
      <p className="text-dim text-sm mb-6">
        {fmtPublished(article.published_at)} · {article.reading_minutes} min de lecture
      </p>

      {article.cover_image_url && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-panel2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
