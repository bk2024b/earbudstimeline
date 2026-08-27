import Link from 'next/link';
import { getAllEarbuds, getBrands, getAncIntelligence } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

function ipScore(value) {
  const match = String(value || '').toUpperCase().match(/IPX?(\d)/);
  return match ? clamp((Number(match[1]) / 8) * 100) : null;
}

function batteryScore(hours) {
  return hours == null ? null : clamp((hours / 12) * 100);
}

function weightScore(weight) {
  return weight == null ? null : clamp(100 - ((weight - 4) / 6) * 100);
}

function normalize(values) {
  const available = values.filter((v) => v != null);
  return available.length ? available.reduce((a, b) => a + b, 0) / available.length : null;
}

function specScore(model, anc) {
  const scores = [
    batteryScore(n(model.battery_bud_h)),
    weightScore(n(model.weight_g)),
    model.anc ? (n(anc?.anc_score) ?? 65) : 25,
    ipScore(model.water_rating),
  ];
  return normalize(scores) == null ? null : Math.round(normalize(scores));
}

function formatPrice(value) {
  return n(value) == null ? '—' : `$${Math.round(n(value))}`;
}

function ProductCard({ row, brand, badge, fr }) {
  const { model, score } = row;
  return (
    <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
      <div className="flex justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">{brand?.name || model.brand_id}</div>
          <h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display font-bold text-xl">{formatPrice(model.price)}</div>
          {badge && <div className="font-mono text-[9px] text-accent mt-1">{badge}</div>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Indice' : 'Index'}</span><strong className="block text-sm mt-1">{score ?? '—'}/100</strong></div>
        <div className="border border-line rounded-lg p-2"><span className="text-dim">ANC</span><strong className="block text-sm mt-1">{model.anc ? 'Yes' : 'No'}</strong></div>
      </div>
      <div className="mt-4 pt-3 border-t border-line flex gap-3 flex-wrap text-[10px] font-mono text-dim">
        <span>{n(model.battery_bud_h) ?? '—'}h</span>
        <span>{n(model.weight_g) ? `${n(model.weight_g)}g` : '—'}</span>
        <span>{model.water_rating || '—'}</span>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr'
    ? 'Meilleurs écouteurs sans fil en 2026 : sélection et comparatif'
    : 'Best Wireless Earbuds in 2026: Top Picks Compared';
  const description = locale === 'fr'
    ? 'Comparez les meilleurs écouteurs sans fil en 2026 selon l’ANC, l’autonomie, le poids, la résistance à l’eau, les fonctionnalités et le prix.'
    : 'Discover the best wireless earbuds in 2026, compared for ANC, battery life, weight, water resistance, features and price.';
  return { title: `${title} | EarbudsTimeline`, description, ...canonicalFor(`/${locale}/guides/best-wireless-earbuds`) };
}

export default async function BestWirelessEarbudsPage({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands, ancRows] = await Promise.all([getAllEarbuds(), getBrands(), getAncIntelligence()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const ancMap = new Map(ancRows.map((r) => [r.earbud_id, r]));

  // This page uses a transparent specification index rather than claiming laboratory sound-test results.
  // The index is deliberately independent of price and only uses data available in the catalog.
  const rows = models
    .filter((m) => n(m.price) != null && n(m.price) > 0)
    .map((model) => ({ model, score: specScore(model, ancMap.get(model.id)), anc: ancMap.get(model.id) }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  const best = rows.filter((r) => r.score != null).slice(0, 8);
  const bestAnc = [...rows].filter((r) => r.model.anc && r.anc?.anc_score != null).sort((a, b) => n(b.anc.anc_score) - n(a.anc.anc_score)).slice(0, 5);
  const bestBattery = [...rows].filter((r) => n(r.model.battery_bud_h) != null).sort((a, b) => n(b.model.battery_bud_h) - n(a.model.battery_bud_h)).slice(0, 5);
  const bestValue = [...rows].filter((r) => r.score != null && n(r.model.price) != null).sort((a, b) => (b.score / n(b.model.price)) - (a.score / n(a.model.price))).slice(0, 5);
  const under100 = rows.filter((r) => n(r.model.price) <= 100).slice(0, 5);
  const androidBrands = ['Samsung', 'Google', 'Nothing', 'OnePlus', 'JBL', 'Sony'];
  const android = rows.filter((r) => androidBrands.some((name) => String(brandMap.get(r.model.brand_id)?.name || '').toLowerCase().includes(name.toLowerCase()))).slice(0, 5);
  const calls = rows.filter((r) => r.model.microphones != null || r.model.mic_count != null).slice(0, 5);

  const title = fr ? 'Meilleurs écouteurs sans fil en 2026' : 'Best Wireless Earbuds in 2026';
  const intro = fr
    ? 'Nous comparons les modèles de notre catalogue selon les caractéristiques disponibles : réduction de bruit, autonomie, poids et résistance à l’eau. L’indice EarbudsTimeline est indépendant du prix et ne remplace pas un test audio de laboratoire.'
    : 'We compare models in our catalog using available specifications: noise cancellation, battery life, weight and water resistance. The EarbudsTimeline Index is independent of price and does not replace laboratory audio testing.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: intro,
    url: `https://earbudstimeline.com/${locale}/guides/best-wireless-earbuds`,
    dateModified: '2026-08-23',
    inLanguage: locale,
  };

  const section = (heading, items, subtitle) => (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="font-display font-semibold text-[25px]">{heading}</h2>
        {subtitle && <p className="text-dim text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((row) => <ProductCard key={row.model.id} row={row} brand={brandMap.get(row.model.brand_id)} fr={fr} />)}
      </div>
    </section>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">Wireless Earbuds · 2026</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
        <div className="mt-4 text-[10px] font-mono text-dim">{fr ? 'Dernière mise à jour : 23 août 2026' : 'Last updated: August 23, 2026'}</div>

        <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="#overall" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">OVERALL</div><div className="font-display font-semibold mt-1">{best.length} picks</div></a>
          <a href="#anc" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">ANC</div><div className="font-display font-semibold mt-1">{bestAnc.length} picks</div></a>
          <a href="#value" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">VALUE</div><div className="font-display font-semibold mt-1">{bestValue.length} picks</div></a>
          <a href="#under-100" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">UNDER $100</div><div className="font-display font-semibold mt-1">{under100.length} picks</div></a>
        </section>

        <section id="overall" className="mt-12">
          <div className="mb-5"><h2 className="font-display font-semibold text-[25px]">🏆 {fr ? 'Meilleurs écouteurs sans fil au global' : 'Best Wireless Earbuds Overall'}</h2><p className="text-dim text-sm mt-1">{fr ? 'Classés par indice de spécifications, sans utiliser le prix comme critère de qualité.' : 'Ranked by the specification index, without using price as a quality criterion.'}</p></div>
          <div className="overflow-x-auto border border-line rounded-2xl bg-panel">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">{fr ? 'Écouteurs' : 'Earbuds'}</th><th className="p-4">{fr ? 'Prix' : 'Price'}</th><th className="p-4">Index</th><th className="p-4">ANC</th><th className="p-4">Battery</th><th className="p-4">Weight</th></tr></thead>
              <tbody>{best.map((r, i) => <tr key={r.model.id} className="border-b border-line last:border-0 hover:bg-panel/70"><td className="p-4 font-mono text-accent">{i + 1}</td><td className="p-4"><Link className="font-semibold hover:text-accent" href={`/ecouteurs/${r.model.id}`}>{r.model.name}</Link><div className="text-dim text-[10px] mt-1">{brandMap.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{formatPrice(r.model.price)}</td><td className="p-4 font-mono font-bold">{r.score}/100</td><td className="p-4">{r.model.anc ? '✓' : '—'}</td><td className="p-4">{n(r.model.battery_bud_h) ?? '—'}h</td><td className="p-4">{n(r.model.weight_g) ? `${n(r.model.weight_g)}g` : '—'}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        {section(fr ? '🔇 Meilleurs écouteurs sans fil pour la réduction de bruit' : '🔇 Best Wireless Earbuds for Noise Cancellation', bestAnc, fr ? 'Classés selon les données ANC disponibles.' : 'Ranked using available ANC intelligence.')}
        <div id="anc" />
        {section(fr ? '💰 Meilleur rapport index / prix' : '💰 Best Value', bestValue, fr ? 'Le prix sert ici uniquement à mesurer la valeur, pas la qualité.' : 'Price is used here only to measure value, not quality.')}
        <div id="value" />
        {section(fr ? '💵 Meilleurs écouteurs sans fil sous 100 $' : '💵 Best Wireless Earbuds Under $100', under100, fr ? 'Voir aussi notre guide budget complet.' : 'See our complete budget guide.')}
        <div id="under-100" />
        {section(fr ? '🔋 Meilleure autonomie' : '🔋 Best Battery Life', bestBattery, fr ? 'Autonomie annoncée par écouteur.' : 'Advertised per-earbud battery life.')}
        {section(fr ? '🤖 Sélection Android' : '🤖 Android Picks', android, fr ? 'Sélection indicative basée sur les marques présentes dans notre catalogue.' : 'Indicative selection based on brands represented in our catalog.')}
        {calls.length > 0 && section(fr ? '📞 Sélection pour les appels' : '📞 Picks for Calls', calls, fr ? 'Modèles pour lesquels une donnée microphone est disponible.' : 'Models with microphone data available in the catalog.')}

        <section className="mt-14">
          <h2 className="font-display font-semibold text-[25px] mb-5">{fr ? 'Comment nous classons les écouteurs' : 'How We Rank Wireless Earbuds'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(fr ? [['Autonomie','Battery life'],['ANC','Noise cancellation'],['Poids','Weight'],['Résistance','Water resistance']] : [['Battery life','Battery'],['ANC','Noise cancellation'],['Weight','Weight'],['Water resistance','Durability']]).map(([label, sub]) => <div key={label} className="border border-line rounded-xl p-4 bg-panel"><div className="font-mono text-accent text-xs">{sub}</div><div className="font-display font-semibold mt-1">{label}</div></div>)}
          </div>
          <p className="text-dim text-xs leading-6 mt-4 max-w-3xl">{fr ? 'L’indice combine uniquement les dimensions de données disponibles dans le catalogue. Les données manquantes ne sont pas transformées en zéro : le poids du critère est redistribué entre les dimensions disponibles. Cet indice n’est pas une note de qualité sonore et ne prétend pas remplacer des mesures indépendantes.' : 'The index uses only dimensions available in the catalog. Missing data is not converted to zero: the criterion weight is redistributed across available dimensions. This is not a sound-quality score and does not claim to replace independent measurements.'}</p>
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-4">
          <div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Explorez les sous-clusters' : 'Explore the sub-clusters'}</h2><div className="mt-4 space-y-2 text-sm"><Link className="block hover:text-accent" href="/guides/best-budget-earbuds">{fr ? '→ Meilleurs écouteurs budget' : '→ Best Budget Earbuds'}</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-under-100">{fr ? '→ Meilleurs écouteurs sous 100 $' : '→ Best Earbuds Under $100'}</Link><Link className="block hover:text-accent" href="/guides/best-noise-cancelling-earbuds">{fr ? '→ Meilleurs écouteurs ANC' : '→ Best Noise Cancelling Earbuds'}</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-for-calls">{fr ? '→ Meilleurs écouteurs pour les appels' : '→ Best Earbuds for Calls'}</Link></div></div>
          <div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Voir les fiches produits' : 'Explore product pages'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Chaque modèle du classement renvoie vers sa fiche détaillée pour consulter les caractéristiques et les données disponibles.' : 'Every ranked model links to its detailed product page for specifications and available data.'}</p><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr ? 'Parcourir le catalogue →' : 'Browse the catalog →'}</Link></div>
        </section>

        <section className="mt-14">
          <h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2>
          <div className="divide-y divide-line border-y border-line">
            {(fr ? [
              ['Quels sont les meilleurs écouteurs sans fil en 2026 ?','Cela dépend de l’usage. Notre classement utilise les données disponibles dans le catalogue pour comparer autonomie, ANC, poids et résistance à l’eau.'],
              ['Quel est le meilleur choix sous 100 $ ?','Consultez la section sous 100 $ et notre guide budget : les meilleurs choix dépendent du compromis entre fonctionnalités, autonomie et prix.'],
              ['Le classement mesure-t-il la qualité sonore ?','Non. L’indice présenté ici est un indice de spécifications. Il ne remplace pas un test audio indépendant.'],
              ['Les prix sont-ils définitifs ?','Non. Les prix peuvent varier selon le marché et le moment. Vérifiez toujours le prix actuel avant l’achat.'],
            ] : [
              ['What are the best wireless earbuds in 2026?','It depends on the use case. Our ranking uses catalog data to compare battery life, ANC, weight and water resistance.'],
              ['What are the best wireless earbuds under $100?','See the under-$100 section and our budget guide. The best choice depends on the trade-off between features, battery life and price.'],
              ['Does the ranking measure sound quality?','No. The index is a specification index. It does not replace independent audio testing.'],
              ['Are the listed prices final?','No. Prices can change by market and over time. Always check the current price before buying.'],
            ]).map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}
          </div>
        </section>
      </article>
      <AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer />
    </>
  );
}
