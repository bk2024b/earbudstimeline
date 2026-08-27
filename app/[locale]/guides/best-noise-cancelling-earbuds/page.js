import Link from 'next/link';
import { getAllEarbuds, getBrands, getAncIntelligence } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const formatPrice = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

function ProductCard({ row, brand, fr }) {
  const { model, intelligence } = row;
  return (
    <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
      <div className="flex justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">{brand?.name || model.brand_id}</div>
          <h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display font-bold text-xl">{formatPrice(model.price)}</div>
          <div className="font-mono text-[9px] text-accent mt-1">ANC {Math.round(n(intelligence?.anc_score) || 0)}/100</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Voyage' : 'Travel'}</span><strong className="block text-sm mt-1">{n(intelligence?.anc_travel_score) != null ? Math.round(n(intelligence.anc_travel_score)) : '—'}</strong></div>
        <div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Bureau' : 'Office'}</span><strong className="block text-sm mt-1">{n(intelligence?.anc_office_score) != null ? Math.round(n(intelligence.anc_office_score)) : '—'}</strong></div>
      </div>
      <div className="mt-4 pt-3 border-t border-line flex gap-3 flex-wrap text-[10px] font-mono text-dim">
        <span>{n(model.battery_bud_h) ?? '—'}h</span><span>{n(model.weight_g) ? `${n(model.weight_g)}g` : '—'}</span><span>{model.water_rating || '—'}</span><span>{intelligence?.source_count ?? 0} {fr ? 'sources' : 'sources'}</span>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Meilleurs écouteurs avec réduction de bruit en 2026' : 'Best Noise Cancelling Earbuds in 2026';
  const description = locale === 'fr'
    ? 'Comparez les meilleurs écouteurs ANC en 2026 selon les données de réduction de bruit, les environnements, l’autonomie, le poids et le prix.'
    : 'Compare the best noise cancelling earbuds in 2026 using ANC intelligence, environment scores, battery life, weight and price.';
  return { title: `${title} | EarbudsTimeline`, description, ...canonicalFor(`/${locale}/guides/best-noise-cancelling-earbuds`) };
}

export default async function BestNoiseCancellingEarbudsPage({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands, ancRows] = await Promise.all([getAllEarbuds(), getBrands(), getAncIntelligence()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const ancMap = new Map(ancRows.map((r) => [r.earbud_id, r]));

  const rows = models
    .map((model) => ({ model, intelligence: ancMap.get(model.id) }))
    .filter((row) => row.model.anc && n(row.intelligence?.anc_score) != null)
    .sort((a, b) => n(b.intelligence.anc_score) - n(a.intelligence.anc_score));

  const best = rows.slice(0, 10);
  const travel = [...rows].filter((r) => n(r.intelligence?.anc_travel_score) != null).sort((a, b) => n(b.intelligence.anc_travel_score) - n(a.intelligence.anc_travel_score)).slice(0, 5);
  const office = [...rows].filter((r) => n(r.intelligence?.anc_office_score) != null).sort((a, b) => n(b.intelligence.anc_office_score) - n(a.intelligence.anc_office_score)).slice(0, 5);
  const traffic = [...rows].filter((r) => n(r.intelligence?.anc_traffic_score) != null).sort((a, b) => n(b.intelligence.anc_traffic_score) - n(a.intelligence.anc_traffic_score)).slice(0, 5);
  const voices = [...rows].filter((r) => n(r.intelligence?.anc_voices_score) != null).sort((a, b) => n(b.intelligence.anc_voices_score) - n(a.intelligence.anc_voices_score)).slice(0, 5);
  const under100 = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 100).slice(0, 5);
  const battery = [...rows].filter((r) => n(r.model.battery_bud_h) != null).sort((a, b) => n(b.model.battery_bud_h) - n(a.model.battery_bud_h)).slice(0, 5);

  const title = fr ? 'Meilleurs écouteurs avec réduction de bruit en 2026' : 'Best Noise Cancelling Earbuds in 2026';
  const intro = fr
    ? 'Notre classement ANC utilise les données d’intelligence de réduction de bruit disponibles dans le catalogue EarbudsTimeline. Les modèles sont classés séparément par performance ANC globale et par environnement.'
    : 'Our ANC ranking uses the noise-cancellation intelligence available in the EarbudsTimeline catalog. Models are ranked separately by overall ANC performance and by environment.';
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro,
    url: `https://earbudstimeline.com/${locale}/guides/best-noise-cancelling-earbuds`, dateModified: '2026-08-24', inLanguage: locale,
  };

  const section = (heading, items, subtitle) => items.length > 0 && (
    <section className="mt-12">
      <div className="mb-5"><h2 className="font-display font-semibold text-[25px]">{heading}</h2><p className="text-dim text-sm mt-1">{subtitle}</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((row) => <ProductCard key={row.model.id} row={row} brand={brandMap.get(row.model.brand_id)} fr={fr} />)}</div>
    </section>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">ANC Intelligence · 2026</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
        <div className="mt-4 text-[10px] font-mono text-dim">{fr ? 'Dernière mise à jour : 24 août 2026' : 'Last updated: August 24, 2026'}</div>

        <section className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[['overall','OVERALL',best],['travel','TRAVEL',travel],['office','OFFICE',office],['traffic','TRAFFIC',traffic],['voices','VOICES',voices]].map(([id,label,items]) => <a key={id} href={`#${id}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">{label}</div><div className="font-display font-semibold mt-1">{items.length} picks</div></a>)}
        </section>

        <section id="overall" className="mt-12">
          <div className="mb-5"><h2 className="font-display font-semibold text-[25px]">🏆 {fr ? 'Meilleurs écouteurs ANC au global' : 'Best Noise Cancelling Earbuds Overall'}</h2><p className="text-dim text-sm mt-1">{fr ? 'Classés selon ANC Intelligence.' : 'Ranked by ANC Intelligence.'}</p></div>
          <div className="overflow-x-auto border border-line rounded-2xl bg-panel">
            <table className="w-full text-left text-xs"><thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">{fr ? 'Écouteurs' : 'Earbuds'}</th><th className="p-4">{fr ? 'Prix' : 'Price'}</th><th className="p-4">ANC</th><th className="p-4">Travel</th><th className="p-4">Office</th><th className="p-4">Sources</th></tr></thead><tbody>{best.map((r,i) => <tr key={r.model.id} className="border-b border-line last:border-0 hover:bg-panel/70"><td className="p-4 font-mono text-accent">{i+1}</td><td className="p-4"><Link className="font-semibold hover:text-accent" href={`/ecouteurs/${r.model.id}`}>{r.model.name}</Link><div className="text-dim text-[10px] mt-1">{brandMap.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{formatPrice(r.model.price)}</td><td className="p-4 font-mono font-bold">{Math.round(n(r.intelligence.anc_score))}</td><td className="p-4">{n(r.intelligence.anc_travel_score) != null ? Math.round(n(r.intelligence.anc_travel_score)) : '—'}</td><td className="p-4">{n(r.intelligence.anc_office_score) != null ? Math.round(n(r.intelligence.anc_office_score)) : '—'}</td><td className="p-4">{r.intelligence.source_count ?? 0}</td></tr>)}</tbody></table>
          </div>
        </section>

        <div id="travel">{section(fr ? '✈️ Meilleurs écouteurs ANC pour les voyages' : '✈️ Best ANC Earbuds for Travel', travel, fr ? 'Classement par score ANC Travel.' : 'Ranked by Travel ANC score.')}</div>
        <div id="office">{section(fr ? '🏢 Meilleurs écouteurs ANC pour le bureau' : '🏢 Best ANC Earbuds for Office', office, fr ? 'Classement par score ANC Office.' : 'Ranked by Office ANC score.')}</div>
        <div id="traffic">{section(fr ? '🚇 Meilleurs écouteurs ANC pour les transports' : '🚇 Best ANC Earbuds for Traffic', traffic, fr ? 'Classement par score ANC Traffic.' : 'Ranked by Traffic ANC score.')}</div>
        <div id="voices">{section(fr ? '🗣️ Meilleurs écouteurs pour réduire les voix' : '🗣️ Best Earbuds for Blocking Voices', voices, fr ? 'Classement par score ANC Voices.' : 'Ranked by Voices ANC score.')}</div>
        {section(fr ? '💵 Meilleurs ANC sous 100 $' : '💵 Best Noise Cancelling Earbuds Under $100', under100, fr ? 'Sélection parmi les modèles ANC à moins de 100 $.' : 'Selection among ANC models priced under $100.')}
        {section(fr ? '🔋 Meilleure autonomie avec ANC' : '🔋 Best Battery Life Among ANC Earbuds', battery, fr ? 'Autonomie annoncée par écouteur.' : 'Advertised per-earbud battery life.')}

        <section className="mt-14">
          <h2 className="font-display font-semibold text-[25px] mb-5">{fr ? 'Comment fonctionne notre classement ANC' : 'How Our ANC Ranking Works'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{(fr ? [['ANC global','Score global de réduction de bruit'],['Travel','Environnements de transport et voyage'],['Office','Bureau et bruit ambiant'],['Traffic','Bruit routier et transports']]:[['Overall ANC','Overall noise-cancellation score'],['Travel','Travel and transport environments'],['Office','Office and ambient noise'],['Traffic','Road and transit noise']]).map(([label,desc]) => <div key={label} className="border border-line rounded-xl p-4 bg-panel"><div className="font-mono text-accent text-xs">{label}</div><div className="text-dim text-xs leading-5 mt-2">{desc}</div></div>)}</div>
          <p className="text-dim text-xs leading-6 mt-4 max-w-3xl">{fr ? 'Cette page ne prétend pas produire elle-même des mesures de laboratoire. Elle expose les scores ANC déjà structurés dans notre couche d’intelligence, ainsi que le nombre de sources disponibles. Les modèles sans score ANC exploitable sont exclus du classement principal.' : 'This page does not claim to perform laboratory measurements itself. It exposes the ANC scores already structured in our intelligence layer, along with the number of available sources. Models without a usable ANC score are excluded from the main ranking.'}</p>
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-4"><div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Comparer avec les autres guides' : 'Explore related guides'}</h2><div className="mt-4 space-y-2 text-sm"><Link className="block hover:text-accent" href="/guides/best-wireless-earbuds">→ {fr ? 'Meilleurs écouteurs sans fil' : 'Best Wireless Earbuds'}</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-under-100">→ {fr ? 'Meilleurs écouteurs sous 100 $' : 'Best Earbuds Under $100'}</Link><Link className="block hover:text-accent" href="/guides/best-budget-earbuds">→ {fr ? 'Meilleurs écouteurs budget' : 'Best Budget Earbuds'}</Link></div></div><div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Voir les produits' : 'Explore products'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Consultez les fiches détaillées pour voir toutes les spécifications disponibles.' : 'Open detailed product pages to see all available specifications.'}</p><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr ? 'Voir le catalogue →' : 'Browse catalog →'}</Link></div></section>

        <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs avec réduction de bruit ?','Notre classement principal utilise le score ANC Intelligence disponible dans le catalogue et distingue aussi plusieurs environnements.'],['Quel est le meilleur ANC pour les voyages ?','Consultez le classement Travel, conçu pour comparer les modèles selon leur score ANC dans les environnements de voyage disponibles.'],['Le score ANC est-il un test de laboratoire EarbudsTimeline ?','Non. La page expose des données ANC structurées dans notre couche d’intelligence ; elle ne prétend pas remplacer des mesures indépendantes.'],['Les écouteurs sous 100 $ peuvent-ils avoir un bon ANC ?','Oui. La section dédiée permet de comparer les modèles ANC sous 100 $ présents dans notre catalogue.']] : [['What are the best noise cancelling earbuds?','Our main ranking uses the ANC Intelligence score available in the catalog and also separates several environments.'],['What are the best ANC earbuds for travel?','See the Travel ranking, which compares models using the available Travel ANC scores.'],['Is the ANC score an EarbudsTimeline laboratory test?','No. The page exposes structured ANC intelligence data and does not claim to replace independent measurements.'],['Can earbuds under $100 have good ANC?','Yes. The dedicated section compares ANC models under $100 represented in our catalog.']]).map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section>
      </article>
      <AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer />
    </>
  );
}
