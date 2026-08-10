import { notFound } from 'next/navigation';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import { getArticleBySlug, getBrands } from '@/lib/queries';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, canonicalFor, JsonLd } from '@/lib/seo';

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
      ...canonicalFor(`/blog/${article.id}`),
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

  const safeHtml = sanitizeHtml(article.content_html || '', {
    allowedTags: ['h2', 'h3', 'p', 'strong', 'em', 's', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'br', 'code', 'pre'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'class'],
    },
  });
  let mentionedBrand = null;
  try {
    const brands = await getBrands();
    const haystack = `${article.title} ${article.excerpt}`.toLowerCase();
    mentionedBrand = brands.find((b) => haystack.includes(b.name.toLowerCase())) || null;
  } catch {
    // pas bloquant : la page s'affiche sans le lien "Tous les X" si ça échoue
  }

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

      <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-line">
        {mentionedBrand && (
          <Link
            href={`/marques/${mentionedBrand.id}`}
            className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
          >
            Tous les {mentionedBrand.name} →
          </Link>
        )}
        <Link
          href="/technologies"
          className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
        >
          Explorer par technologie →
        </Link>
        <Link
          href="/comparaisons"
          className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
        >
          Voir des comparaisons →
        </Link>
      </div>
    </article>
  );
}
