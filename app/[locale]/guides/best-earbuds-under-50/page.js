import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(
  100,
  45 +
    (n(m.price) != null && n(m.price) <= 50 ? 20 : 0) +
    (m.anc ? 8 : 0) +
    ((n(m.battery_bud_h) || 0) >= 7 ? 10 : ((n(m.battery_bud_h) || 0) >= 5 ? 5 : 0)) +
    ((n(m.weight_g) || 99) <= 8 ? 7 : 0) +
    (m.transparency_mode || m.transparency ? 5 : 0)
);

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Meilleurs écouteurs à moins de 50 $ en 2026' : 'Best Earbuds Under $50 in 2026';
  return {
    title: `${title} | EarbudsTimeline`,
    description: locale === 'fr'
      ? 'Les meilleurs écouteurs sans fil à moins de 50 $, comparés selon prix, autonomie et fonctionnalités.'
      : 'The best wireless earbuds under $50, compared by price, battery life and features.',
    ...canonicalFor(`/${locale}/guides/best-earbuds-under-50`)
  };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models
    .filter((m) => n(m.price) != null && n(m.price) <= 50)
    .map((model) => ({ model, score: score(model) }))
    .sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10);
  const title = fr ? 'Meilleurs écouteurs à moins de 50 $ en 2026' : 'Best Earbuds Under $50 in 2026';
  const intro = fr
    ? 'Une sélection des meilleurs écouteurs disponibles à 50 $ ou moins dans notre catalogue, avec un classement indicatif basé sur leurs caractéristiques.'
    : 'A selection of the best earbuds priced at $50 or less in our catalog, with an indicative ranking based on their specifications.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: intro,
    url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-under-50`,
    dateModified: '2026-08-26',
    inLanguage: locale
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Under $50 · 2026</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
        <div className="mt-4 text-[10px] font-mono text-dim">
          {fr ? 'Dernière mise à jour : 26 août 2026' : 'Last updated: August 26, 2026'}
        </div>

        <section className="mt-10">
          <h2 className="font-display font-semibold text-[25px]">💰 {fr ? 'Meilleurs écouteurs sous 50 $' : 'Best Earbuds Under $50 Overall'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {best.map((r) => (
              <Link key={r.model.id} href={`/${locale}/ecouteurs/${r.model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent">
                <div className="font-mono text-[10px] text-accent">{bm.get(r.model.brand_id)?.name || r.model.brand_id}</div>
                <div className="flex justify-between gap-4 mt-1">
                  <h3 className="font-display font-semibold">{r.model.name}</h3>
                  <div className="text-right">
                    <b>{price(r.model.price)}</b>
                    <div className="font-mono text-[9px] text-accent">{r.score}/100</div>
                  </div>
                </div>
                <div className="mt-4 text-[10px] font-mono text-dim">
                  {r.model.anc ? 'ANC · ' : ''}
                  {n(r.model.battery_bud_h) != null ? `${n(r.model.battery_bud_h)}h` : 'Battery —'}
                  {' · '}
                  {r.model.transparency_mode || r.model.transparency ? 'Transparency' : ''}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-[25px]">{fr ? 'À quoi s’attendre sous 50 $' : 'What to expect under $50'}</h2>
          <p className="text-dim text-sm leading-7 max-w-3xl mt-3">
            {fr
              ? 'À ce prix, les fonctionnalités et la qualité peuvent varier fortement. Vérifiez notamment l’autonomie, la qualité des appels, la résistance et la compatibilité avant l’achat.'
              : 'At this price, features and quality can vary significantly. Check battery life, call quality, resistance and compatibility before buying.'}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2>
          <p className="text-dim text-sm leading-7 max-w-3xl mt-3">
            {fr
              ? 'Le classement utilise uniquement les données disponibles dans notre catalogue et privilégie le prix, l’autonomie et les fonctionnalités disponibles. Il ne remplace pas un test indépendant.'
              : 'The ranking uses only data available in our catalog and prioritizes price, battery life and available features. It does not replace independent testing.'}
          </p>
        </section>

        <section className="mt-12 border border-line rounded-2xl p-6 bg-panel">
          <h2 className="font-display font-semibold text-xl">{fr ? 'Guides associés' : 'Related guides'}</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
            <Link className="hover:text-accent" href={`/${locale}/guides/best-budget-earbuds`}>→ Best Budget Earbuds</Link>
            <Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-under-100`}>→ Best Earbuds Under $100</Link>
            <Link className="hover:text-accent" href={`/${locale}/guides/best-cheap-wireless-earbuds`}>→ Best Cheap Wireless Earbuds</Link>
            <Link className="hover:text-accent" href={`/${locale}/guides/best-affordable-anc-earbuds`}>→ Best Affordable ANC Earbuds</Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2>
          <div className="divide-y divide-line border-y border-line">
            {(fr
              ? [
                  ['Quels sont les meilleurs écouteurs à moins de 50 $ ?', 'Le meilleur choix dépend des priorités. Les modèles avec une bonne autonomie et des fonctionnalités utiles offrent souvent le meilleur compromis.'],
                  ['Peut-on avoir de bons écouteurs ANC sous 50 $ ?', 'Certains modèles proposent une réduction de bruit à ce prix, mais son efficacité varie fortement selon le modèle.'],
                  ['Les écouteurs à moins de 50 $ sont-ils fiables ?', 'La fiabilité varie selon la marque et le modèle. Consultez les caractéristiques et la garantie disponibles avant achat.']
                ]
              : [
                  ['What are the best earbuds under $50?', 'The best choice depends on priorities. Models with solid battery life and useful features can offer a strong value.'],
                  ['Can you get good ANC earbuds under $50?', 'Some models offer noise cancellation at this price, but effectiveness varies significantly by model.'],
                  ['Are earbuds under $50 reliable?', 'Reliability varies by brand and model. Check specifications and warranty information before buying.']
                ]).map(([q, a]) => (
              <details key={q} className="py-4">
                <summary className="cursor-pointer font-display font-medium">{q}</summary>
                <p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
      <AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer />
    </>
  );
}
