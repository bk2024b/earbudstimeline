import Link from 'next/link';

function fmtPublished(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HomeArticles({ articles }) {
  if (articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] m-0">Articles à la une</h2>
        <Link href="/blog" className="text-xs text-accent hover:underline">
          Voir tous les articles →
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/blog/${a.id}`}
            className="flex items-center gap-3.5 bg-panel border border-line rounded-xl p-3 hover:border-accent transition-colors"
          >
            <div className="w-16 h-16 rounded-lg bg-panel2 shrink-0 overflow-hidden">
              {a.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[13.5px] font-medium truncate">{a.title}</p>
              <p className="m-0 text-dim text-[11px] mt-0.5">
                {fmtPublished(a.published_at)} · {a.reading_minutes} min de lecture
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
