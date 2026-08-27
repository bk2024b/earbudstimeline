import Link from 'next/link';
import { getAllEarbuds, getBrands, getAncIntelligence } from '@/lib/queries';
import { rankByValuePerDollar } from '@/lib/budgetValue';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const formatPrice = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Meilleurs écouteurs sans fil à moins de 100 $ en 2026' : 'Best Wireless Earbuds Under $100 in 2026';
  const description = locale === 'fr'
    ? 'Comparez les meilleurs écouteurs sans fil à moins de 100 $ selon les fonctionnalités, l’ANC, l’autonomie, le confort et le rapport qualité-prix.'
    : 'Compare the best wireless earbuds under $100 for features, ANC, battery life, comfort and value.';
  return { title: `${title} | EarbudsTimeline`, description, ...canonicalFor(`/${locale}/guides/best-earbuds-under-100`) };
}

function Card({ row, brand, fr }) {
  const { model } = row;
  return (
    <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
      <div className="flex justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">{brand?.name || model.brand_id}</div>
          <h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3>
        </div>
        <div className="font-display font-bold text-xl shrink-0">{formatPrice(model.price)}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Valeur' : 'Value'}</span><strong className="block text-sm mt-1">{row.value_per_dollar ?? '—'}/100</strong></div>
        <div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Utilité' : 'Utility'}</span><strong className="block text-sm mt-1">{row.utility_score ?? '—'}/100</strong></div>
      </div>
      <div className="mt-4 pt-3 border-t border-line flex gap-3 flex-wrap text-[10px] font-mono text-dim">
        <span>{n(model.battery_bud_h) ?? '—'}h</span>
        <span>{model.anc ? 'ANC' : 'No ANC'}</span>
        <span>{model.water_rating || '—'}</span>
        <span>{n(model.weight_g) ? `${n(model.weight_g)}g` : '—'}</span>
      </div>
    </Link>
  );
}

export default async function BestEarbudsUnder100Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands, ancRows] = await Promise.all([getAllEarbuds(), getBrands(), getAncIntelligence()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const ancMap = new Map(ancRows.map((r) => [r.earbud_id, r]));

  const candidates = models
    .filter((m) => n(m.price) != null && n(m.price) > 0 && n(m.price) <= 100)
    .map((model) => ({ ...model, anc_score: ancMap.get(model.id)?.anc_score ?? null }));
  const ranked = rankByValuePerDollar(candidates)
    .map((item) => ({
      model: item.model,
      utility_score: item.utility_score,
      value_per_dollar: item.value_per_dollar,
      intelligence: ancMap.get(item.model.id),
    }))
    .filter((r) => r.value_per_dollar != null);

  const best = ranked.slice(0, 10);
  const best50 = ranked.filter((r) => n(r.model.price) <= 50).slice(0, 5);
  const bestAnc = [...ranked].filter((r) => r.model.anc && r.intelligence?.anc_score != null).sort((a, b) => n(b.intelligence.anc_score) - n(a.intelligence.anc_score)).slice(0, 5);
  const bestBattery = [...ranked].filter((r) => n(r.model.battery_bud_h) != null).sort((a, b) => n(b.model.battery_bud_h) - n(a.model.battery_bud_h)).slice(0, 5);

  const title = fr ? 'Meilleurs écouteurs sans fil à moins de 100 $ en 2026' : 'Best Wireless Earbuds Under $100 in 2026';
  const intro = fr
    ? 'Une sélection dynamique des meilleurs écouteurs de notre catalogue à moins de 100 $, classés par rapport entre utilité et prix. Le classement ne traite pas le prix comme une mesure de qualité.'
    : 'A dynamic selection of the best earbuds in our catalog under $100, ranked by the relationship between utility and price. Price is not treated as a measure of quality.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-under-100`, dateModified: '2026-08-24', inLanguage: locale };

  const section = (heading, items, subtitle) => items.length > 0 && (
    <section className="mt-12">
      <div className="mb-5"><h2 className="font-display font-semibold text-[25px]">{heading}</h2><p className="text-dim text-sm mt-1">{subtitle}</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((row) => <Card key={row.model.id} row={row} brand={brandMap.get(row.model.brand_id)} fr={fr} />)}</div>
    </section>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">Under $100 · 2026</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
        <div className="mt-4 text-[10px] font-mono text-dim">{fr ? 'Dernière mise à jour : 24 août 2026' : 'Last updated: August 24, 2026'}</div>

        <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="#overall" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">OVERALL</div><div className="font-display font-semibold mt-1">{best.length} picks</div></a>
          <a href="#under-50" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">UNDER $50</div><div className="font-display font-semibold mt-1">{best50.length} picks</div></a>
          <a href="#anc" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">ANC</div><div className="font-display font-semibold mt-1">{bestAnc.length} picks</div></a>
          <a href="#battery" className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">BATTERY</div><div className="font-display font-semibold mt-1">{bestBattery.length} picks</div></a>
        </section>

        <section id="overall" className="mt-12">
          <div className="mb-5"><h2 className="font-display font-semibold text-[25px]">🏆 {fr ? 'Meilleurs écouteurs sous 100 $' : 'Best Earbuds Under $100 Overall'}</h2><p className="text-dim text-sm mt-1">{fr ? 'Classement dynamique par Value per Dollar.' : 'Dynamic ranking by Value per Dollar.'}</p></div>
          <div className="overflow-x-auto border border-line rounded-2xl bg-panel">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">{fr ? 'Écouteurs' : 'Earbuds'}</th><th className="p-4">{fr ? 'Prix' : 'Price'}</th><th className="p-4">Value</th><th className="p-4">Utility</th><th className="p-4">ANC</th><th className="p-4">Battery</th></tr></thead>
              <tbody>{best.map((r, i) => <tr key={r.model.id} className="border-b border-line last:border-0 hover:bg-panel/70"><td className="p-4 font-mono text-accent">{i + 1}</td><td className="p-4"><Link className="font-semibold hover:text-accent" href={`/ecouteurs/${r.model.id}`}>{r.model.name}</Link><div className="text-dim text-[10px] mt-1">{brandMap.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{formatPrice(r.model.price)}</td><td className="p-4 font-mono font-bold">{r.value_per_dollar}/100</td><td className="p-4 font-mono">{r.utility_score}/100</td><td className="p-4">{r.model.anc ? '✓' : '—'}</td><td className="p-4">{n(r.model.battery_bud_h) ?? '—'}h</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <div id="under-50">{section(fr ? '💵 Meilleurs écouteurs sous 50 $' : '💵 Best Earbuds Under $50', best50, fr ? 'Les meilleurs compromis dans le budget le plus serré.' : 'The strongest compromises at the tighter budget.')}</div>
        <div id="anc">{section(fr ? '🔇 Meilleurs ANC sous 100 $' : '🔇 Best ANC Earbuds Under $100', bestAnc, fr ? 'Classés selon les données ANC disponibles.' : 'Ranked using available ANC intelligence.')}</div>
        <div id="battery">{section(fr ? '🔋 Meilleure autonomie sous 100 $' : '🔋 Best Battery Life Under $100', bestBattery, fr ? 'Autonomie annoncée par écouteur.' : 'Advertised per-earbud battery life.')}</div>

        <section className="mt-14 grid md:grid-cols-2 gap-4">
          <div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Budget vs moins de 100 $' : 'Budget vs Under $100'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Cette page cible le budget précis sous 100 $. Pour une analyse plus large des écouteurs budget, consultez notre guide dédié.' : 'This page targets the specific under-$100 intent. For a broader budget analysis, see our dedicated budget guide.'}</p><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/guides/best-budget-earbuds">{fr ? 'Guide budget →' : 'Budget guide →'}</Link></div>
          <div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Comparer les modèles' : 'Compare the models'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Ouvrez une fiche produit pour consulter toutes les spécifications disponibles et poursuivre vers les comparaisons.' : 'Open a product page to see all available specifications and continue to comparisons.'}</p><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr ? 'Voir le catalogue →' : 'Browse catalog →'}</Link></div>
        </section>

        <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs sous 100 $ ?','Notre classement utilise le moteur Value per Dollar pour comparer les modèles du catalogue jusqu’à 100 $.'],['Les écouteurs à 50 $ sont-ils meilleurs que ceux à 100 $ ?','Pas nécessairement. Le Utility Score mesure l’utilité indépendamment du prix, puis le Value per Dollar mesure le compromis entre cette utilité et le prix.'],['Le prix affiché est-il garanti ?','Non. Les prix peuvent changer selon le marché et le moment. Vérifiez toujours le prix actuel avant l’achat.'],['Pourquoi certains modèles sont-ils absents ?','Seuls les modèles avec un prix valide et inférieur ou égal à 100 $ peuvent entrer dans ce classement.']] : [['What are the best earbuds under $100?','Our ranking uses the Value per Dollar engine to compare catalog models priced at or below $100.'],['Are $50 earbuds better than $100 earbuds?','Not necessarily. Utility Score measures utility independently of price, then Value per Dollar measures the trade-off between utility and price.'],['Are listed prices guaranteed?','No. Prices can change by market and over time. Always verify the current price before buying.'],['Why are some models missing?','Only models with a valid price at or below $100 can enter this ranking.']]).map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section>
      </article>
      <AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer />
    </>
  );
}
