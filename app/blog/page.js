import Link from 'next/link';
import { getPublishedArticles } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog — EarbudsTimeline',
  description: "Actualités, comparatifs et analyses sur l'univers des écouteurs sans fil.",
};

function fmtPublished(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-2">Blog</h1>
      <p className="text-dim mb-8">Actualités, comparatifs et analyses sur l&apos;univers des écouteurs sans fil.</p>

      {articles.length === 0 && <p className="text-dim">Aucun article publié pour l&apos;instant.</p>}

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
                {fmtPublished(a.published_at)} · {a.reading_minutes} min de lecture
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
