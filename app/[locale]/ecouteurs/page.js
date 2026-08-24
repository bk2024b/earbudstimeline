import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;

function formatPrice(value) {
  return n(value) == null ? '—' : `$${Math.round(n(value))}`;
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Tous les écouteurs — EarbudsTimeline' : 'All Earbuds — EarbudsTimeline';
  const description = locale === 'fr'
    ? 'Parcourez le catalogue EarbudsTimeline et consultez les fiches détaillées des écouteurs.'
    : 'Browse the EarbudsTimeline catalog and explore detailed earbud product pages.';
  return { title, description, ...canonicalFor(`/${locale}/ecouteurs`) };
}

export default async function EarbudsCatalogPage({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const sorted = [...models].sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: fr ? 'Tous les écouteurs' : 'All Earbuds',
    url: `https://earbudstimeline.com/${locale}/ecouteurs`,
    inLanguage: locale,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">Earbuds Catalog</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">
          {fr ? 'Tous les écouteurs' : 'All Earbuds'}
        </h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">
          {fr
            ? `Explorez ${sorted.length} modèles et ouvrez leur fiche complète.`
            : `Explore ${sorted.length} models and open their complete product pages.`}
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((model) => {
            const brand = brandMap.get(model.brand_id);
            return (
              <Link
                key={model.id}
                href={`/ecouteurs/${model.id}`}
                className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"
              >
                <div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">
                  {brand?.name || model.brand_id}
                </div>
                <h2 className="font-display font-semibold text-[17px] mt-1">{model.name}</h2>
                <div className="mt-4 flex gap-3 flex-wrap text-[10px] font-mono text-dim">
                  <span>{formatPrice(model.price)}</span>
                  <span>{n(model.battery_bud_h) ?? '—'}h</span>
                  <span>{model.anc ? 'ANC' : 'No ANC'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </article>
      <Footer />
    </>
  );
}
