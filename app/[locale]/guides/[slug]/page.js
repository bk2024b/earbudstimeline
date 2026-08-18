import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { getGuide } from '@/lib/guidePages';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { GUIDE_PAGES } = await import('@/lib/guidePages');
  return GUIDE_PAGES.flatMap((guide) =>
    ['en', 'fr'].map((locale) => ({ locale, slug: guide.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const copy = guide[locale] || guide.en;
  return {
    title: `${copy.title} | EarbudsTimeline`,
    description: copy.description,
    ...canonicalFor(`/${locale}/guides/${slug}`),
  };
}

function ProductCard({ model, brand, locale }) {
  return (
    <Link
      href={`/ecouteurs/${model.id}`}
      className="bg-panel border border-line rounded-xl p-4 hover:border-accent transition-colors block"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">
            {brand?.name || model.brand_id}
          </div>
          <h3 className="font-display font-semibold text-[15px] leading-tight">{model.name}</h3>
        </div>
        {model.price != null && <span className="font-mono text-xs shrink-0">${model.price}</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs text-dim">
        <span>Battery: {model.battery_bud_h ?? '—'} h</span>
        <span>Weight: {model.weight_g ?? '—'} g</span>
        <span>ANC: {model.anc ? 'Yes' : 'No'}</span>
        <span>Bluetooth: {model.bluetooth || '—'}</span>
      </div>
    </Link>
  );
}

export default async function GuidePage({ params }) {
  const { locale, slug } = params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const copy = guide[locale] || guide.en;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));

  let candidates = models.filter((model) => !guide.filter || guide.filter(model));
  if (guide.brand) candidates = candidates.filter((model) => model.brand_id === guide.brand);
  if (guide.sort) candidates = [...candidates].sort(guide.sort);
  candidates = candidates.slice(0, 12);

  const title = copy.title;
  const description = copy.description;
  const isComparison = guide.compare;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          url: `https://earbudstimeline.com/${locale}/guides/${slug}`,
        }}
      />

      <article className="max-w-4xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Earbuds Guide</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[44px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[16px] leading-7 max-w-3xl">{copy.intro}</p>

        <div className="grid gap-8 mt-10">
          {copy.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-display font-semibold text-[21px] mb-2">{heading}</h2>
              <p className="text-dim text-[14px] leading-7">{body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-1">
                {isComparison ? 'Explore the catalogue' : 'Current catalogue'}
              </div>
              <h2 className="font-display font-semibold text-[24px]">
                {isComparison ? 'AirPods & Galaxy Buds' : locale === 'fr' ? 'Modèles à découvrir' : 'Models to explore'}
              </h2>
            </div>
            <span className="font-mono text-xs text-dim">{candidates.length} models</span>
          </div>

          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {candidates.map((model) => (
                <ProductCard key={model.id} model={model} brand={brandMap.get(model.brand_id)} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="border border-line rounded-xl p-6 text-dim text-sm">
              {locale === 'fr' ? 'Aucun modèle ne correspond actuellement aux données disponibles.' : 'No models currently match the available data.'}
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/trouver-mes-ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">
            {locale === 'fr' ? 'Trouver mes écouteurs' : 'Find my earbuds'}
          </Link>
          <Link href="/ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">
            {locale === 'fr' ? 'Voir tous les modèles' : 'Browse all models'}
          </Link>
        </div>
      </article>

      <Footer locale={locale} />
    </>
  );
}
