import { notFound } from 'next/navigation';
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

const ANC_CONTENT = {
  en: {
    kicker: 'ANC Guide',
    quickTitle: 'Our top ANC picks',
    methodology: 'We first include only models explicitly marked with ANC in the catalogue. The ordering then uses the available quality score, followed by rated earbud battery life and weight. This is a specification-led shortlist, not a laboratory ANC ranking.',
    sections: [
      ['What makes ANC earbuds good?', 'Active noise cancellation is a system rather than a single specification. Real-world performance depends on microphones, signal processing, the earbud seal and the frequencies present around you. Comfort and battery life also determine whether ANC is useful over a full day.'],
      ['ANC for commuting, flights and work', 'Commuters usually benefit from effective isolation and comfortable long-session wear. For flights, battery life and passive sealing become especially useful. At work, comfort and a good transparency mode can matter as much as maximum cancellation.'],
      ['ANC is not the same as passive isolation', 'The physical seal of an earbud can block some outside sound even when ANC is disabled. ANC adds electronic cancellation on top of that passive isolation, which is why fit remains important even on premium models.'],
      ['How to choose the right pair', 'Start with your environment and budget. Then compare fit, battery life, weight, Bluetooth and the features you actually need. Finally, open the individual product page to check the complete specification set and current data quality.'],
    ],
    faqTitle: 'ANC earbuds FAQ',
    faq: [
      ['What are noise cancelling earbuds?', 'They use microphones and signal processing to reduce some external sounds. The physical fit also contributes passive isolation.'],
      ['Is ANC worth it for everyday use?', 'It can be particularly useful on public transport, during travel and in noisy work environments. In quiet rooms, comfort and sound quality may matter more.'],
      ['Does stronger ANC always mean better earbuds?', 'No. ANC is only one part of the experience. Battery life, comfort, fit, call performance, transparency mode and device compatibility can be equally important.'],
      ['How should I choose between ANC earbuds?', 'Choose based on your environment and budget, then compare fit, battery life, weight and the other features you actually need.'],
    ],
  },
  fr: {
    kicker: 'Guide ANC',
    quickTitle: 'Notre sélection ANC',
    methodology: 'Nous retenons d’abord uniquement les modèles dont l’ANC est explicitement renseigné dans la base. Le classement utilise ensuite le quality score disponible, puis l’autonomie annoncée des écouteurs et le poids. Il s’agit d’une sélection basée sur les caractéristiques, pas d’un classement issu de mesures de laboratoire.',
    sections: [
      ['Qu’est-ce qui fait un bon ANC ?', 'La réduction active du bruit est un système et non une simple caractéristique. Son efficacité dépend des microphones, du traitement du signal, de l’ajustement et des fréquences présentes dans votre environnement. Le confort et l’autonomie déterminent aussi l’utilité réelle de l’ANC.'],
      ['ANC dans les transports, l’avion et au travail', 'Dans les transports, une bonne isolation et un port confortable sont importants. En avion, l’autonomie et l’isolation passive deviennent particulièrement utiles. Au travail, le confort et un bon mode transparence peuvent compter autant que la réduction maximale du bruit.'],
      ['ANC et isolation passive sont différents', 'La forme et l’embout peuvent déjà bloquer une partie des bruits extérieurs lorsque l’ANC est désactivé. L’ANC ajoute une réduction électronique à cette isolation passive : un bon ajustement reste donc essentiel.'],
      ['Comment choisir le bon modèle', 'Commencez par votre environnement et votre budget. Comparez ensuite maintien, autonomie, poids, Bluetooth et fonctions réellement utiles. Consultez enfin la fiche individuelle pour vérifier toutes les caractéristiques disponibles et la qualité actuelle des données.'],
    ],
    faqTitle: 'FAQ sur les écouteurs ANC',
    faq: [
      ['Qu’est-ce qu’un écouteur avec ANC ?', 'Il utilise des microphones et un traitement du signal pour réduire certains bruits extérieurs. La forme de l’écouteur apporte aussi une isolation passive.'],
      ['L’ANC est-il utile au quotidien ?', 'Il peut être particulièrement utile dans les transports, en voyage et dans les environnements bruyants. Dans une pièce calme, le confort et la qualité sonore peuvent être plus importants.'],
      ['Un ANC plus puissant signifie-t-il forcément de meilleurs écouteurs ?', 'Non. L’ANC n’est qu’un élément. Autonomie, confort, maintien, appels, mode transparence et compatibilité peuvent être tout aussi importants.'],
      ['Comment choisir entre plusieurs modèles ANC ?', 'Choisissez selon votre environnement et votre budget, puis comparez maintien, autonomie, poids et fonctions réellement utiles.'],
    ],
  },
};

function ProductCard({ model, brand, locale, rank }) {
  return (
    <Link
      href={`/ecouteurs/${model.id}`}
      className="bg-panel border border-line rounded-xl p-4 hover:border-accent transition-colors block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <span className="font-mono text-accent text-sm shrink-0">#{rank}</span>
          <div className="min-w-0">
            <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">{brand?.name || model.brand_id}</div>
            <h3 className="font-display font-semibold text-[15px] leading-tight">{model.name}</h3>
          </div>
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

function FAQ({ items, title }) {
  return (
    <section className="mt-14">
      <h2 className="font-display font-semibold text-[24px] mb-5">{title}</h2>
      <div className="divide-y divide-line border-y border-line">
        {items.map(([question, answer]) => (
          <details key={question} className="py-4 group">
            <summary className="cursor-pointer list-none font-display font-medium flex justify-between gap-4">
              {question}
              <span className="text-accent group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function GuidePage({ params }) {
  const { locale, slug } = params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const copy = guide[locale] || guide.en;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));
  const isANC = slug === 'best-noise-cancelling-earbuds';
  const enhanced = isANC ? ANC_CONTENT[locale] || ANC_CONTENT.en : null;

  let candidates = models.filter((model) => !guide.filter || guide.filter(model));
  if (guide.brand) candidates = candidates.filter((model) => model.brand_id === guide.brand);
  if (guide.sort) candidates = [...candidates].sort(guide.sort);
  candidates = candidates.slice(0, 12);

  const title = copy.title;
  const description = copy.description;
  const sections = enhanced?.sections || copy.sections;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `https://earbudstimeline.com/${locale}/guides/${slug}`,
  };

  if (enhanced?.faq) {
    jsonLd.mainEntity = enhanced.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    }));
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-5xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">{enhanced?.kicker || 'Earbuds Guide'}</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{copy.intro}</p>

        {enhanced && (
          <div className="mt-8 rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-2">{enhanced.quickTitle}</div>
            <p className="text-dim text-sm leading-7">{enhanced.methodology}</p>
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-1">{enhanced ? enhanced.quickTitle : locale === 'fr' ? 'Modèles à découvrir' : 'Models to explore'}</div>
              <h2 className="font-display font-semibold text-[25px]">{locale === 'fr' ? 'Les modèles à comparer' : 'Models to compare'}</h2>
            </div>
            <span className="font-mono text-xs text-dim">{candidates.length} models</span>
          </div>
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {candidates.map((model, index) => (
                <ProductCard key={model.id} model={model} brand={brandMap.get(model.brand_id)} locale={locale} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="border border-line rounded-xl p-6 text-dim text-sm">{locale === 'fr' ? 'Aucun modèle ne correspond actuellement aux données disponibles.' : 'No models currently match the available data.'}</div>
          )}
        </section>

        <div className="grid gap-8 mt-12">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-display font-semibold text-[21px] mb-2">{heading}</h2>
              <p className="text-dim text-[14px] leading-7">{body}</p>
            </section>
          ))}
        </div>

        {enhanced?.faq && <FAQ items={enhanced.faq} title={enhanced.faqTitle} />}

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/trouver-mes-ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Trouver mes écouteurs' : 'Find my earbuds'}</Link>
          <Link href="/ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Voir tous les modèles' : 'Browse all models'}</Link>
        </div>
      </article>
      <Footer locale={locale} />
    </>
  );
}
