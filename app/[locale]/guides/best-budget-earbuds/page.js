import { Link } from '@/i18n/navigation';
import { getAllEarbuds, getBrands, getAncIntelligence } from '@/lib/queries';
import { rankByValuePerDollar } from '@/lib/budgetValue';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Les meilleurs écouteurs sans fil pas chers : sélection par prix et rapport qualité-prix' : 'Best Budget Earbuds: Best Picks by Price, Value and Features';
  const description = locale === 'fr' ? 'Comparez les meilleurs écouteurs abordables par budget, autonomie, ANC, résistance à l’eau et rapport qualité-prix.' : 'Compare the best budget earbuds by price, battery life, ANC, water resistance and overall value.';
  return { title: `${title} | EarbudsTimeline`, description, ...canonicalFor(`/${locale}/guides/best-budget-earbuds`) };
}

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const batteryScore = (h) => h == null ? null : clamp((h / 12) * 100);
const weightScore = (w) => w == null ? null : clamp(100 - ((w - 4) / 6) * 100);
const waterScore = (v) => { const m = String(v || '').toUpperCase().match(/IPX?(\d)/); return m ? clamp((Number(m[1]) / 8) * 100) : null; };
const formatPrice = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

function Score({ value, label }) { return <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-dim w-20">{label}</span><div className="h-1.5 flex-1 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${value ?? 0}%` }} /></div><span className="font-mono text-[10px] w-8 text-right">{value ?? '—'}</span></div>; }
function Card({ row, brand, badge, fr }) {
  const { model, intelligence } = row;
  const utility = row.utility_score;
  const value = row.value_per_dollar;
  const ratio = row.raw_value_ratio;
  return <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
    <div className="flex justify-between gap-4"><div className="min-w-0"><div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">{brand?.name || model.brand_id}</div><h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3></div><div className="text-right shrink-0"><div className="font-display font-bold text-xl">{formatPrice(model.price)}</div>{badge && <div className="font-mono text-[9px] text-accent mt-1">{badge}</div>}</div></div>
    <div className="mt-4 space-y-2"><Score label="Utility" value={utility} /><Score label={fr ? 'Valeur / $' : 'Value / $'} value={value} />{intelligence?.anc_score != null && <Score label="ANC" value={Math.round(n(intelligence.anc_score))} />}</div>
    <div className="mt-4 pt-3 border-t border-line flex gap-3 flex-wrap text-[10px] font-mono text-dim"><span>{n(model.battery_bud_h) ?? '—'}h battery</span><span>{model.water_rating || '—'}</span><span>{n(model.weight_g) ? `${n(model.weight_g)}g` : '—'}</span>{ratio != null && <span>{ratio.toFixed(2)} utility/$</span>}</div>
  </Link>;
}

export default async function BestBudgetEarbudsPage({ params }) {
  const { locale } = params; const fr = locale === 'fr';
  const [models, brands, ancRows] = await Promise.all([getAllEarbuds(), getBrands(), getAncIntelligence()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const ancMap = new Map(ancRows.map((r) => [r.earbud_id, r]));

  // Budget candidates are ranked by the dedicated Value per Dollar engine.
  // Price is used only as the denominator of value, never as a quality score.
  const candidates = models.filter((m) => n(m.price) != null && n(m.price) > 0 && n(m.price) <= 100).map((model) => ({
    ...model,
    anc_score: ancMap.get(model.id)?.anc_score ?? null,
  }));
  const rankedEngine = rankByValuePerDollar(candidates);
  const rows = rankedEngine.map((item) => ({
    model: item.model,
    intelligence: ancMap.get(item.model.id),
    utility_score: item.utility_score,
    raw_value_ratio: item.raw_value_ratio,
    value_per_dollar: item.value_per_dollar,
  }));
  const ranked = rows.filter((r) => r.value_per_dollar != null);
  const under = (limit) => ranked.filter((r) => n(r.model.price) <= limit).slice(0, 5);
  const best = ranked.slice(0, 8);
  const bestAnc = [...rows].filter((r) => r.intelligence?.anc_score != null).sort((a, b) => n(b.intelligence.anc_score) - n(a.intelligence.anc_score)).slice(0, 5);
  const bestBattery = [...rows].filter((r) => n(r.model.battery_bud_h) != null).sort((a, b) => n(b.model.battery_bud_h) - n(a.model.battery_bud_h)).slice(0, 5);
  const bestSport = [...rows].filter((r) => waterScore(r.model.water_rating) != null).sort((a, b) => (waterScore(b.model.water_rating) || 0) + (weightScore(n(b.model.weight_g)) || 0) - ((waterScore(a.model.water_rating) || 0) + (weightScore(n(a.model.weight_g)) || 0))).slice(0, 5);
  const title = fr ? 'Les meilleurs écouteurs sans fil pas chers' : 'Best Budget Earbuds';
  const intro = fr ? 'Les meilleurs écouteurs budget ne sont pas simplement les moins chers. Nous comparons les modèles jusqu’à 100 $ avec un Utility Score indépendant du prix, puis calculons leur Value per Dollar pour identifier les meilleurs achats.' : 'The best budget earbuds are not simply the cheapest. We compare models up to $100 with a price-independent Utility Score, then calculate Value per Dollar to identify the strongest buys.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-budget-earbuds` };
  const section = (heading, items, badge) => <section className="mt-12"><div className="mb-5"><h2 className="font-display font-semibold text-[25px]">{heading}</h2><p className="text-dim text-sm mt-1">{badge}</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((r) => <Card key={r.model.id} row={r} brand={brandMap.get(r.model.brand_id)} badge={badge} fr={fr} />)}</div></section>;
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">Budget Intelligence</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">{[30, 50, 75, 100].map((limit) => <a key={limit} href={`#under-${limit}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">UNDER ${limit}</div><div className="font-display font-semibold mt-1">{under(limit).length} picks</div></a>)}</div>
    {section(fr ? '🏆 Meilleur Value per Dollar' : '🏆 Best Value per Dollar', best, fr ? 'Value per Dollar /100' : 'Value per Dollar /100')}
    {[30,50,75,100].map((limit) => <div id={`under-${limit}`} key={limit}>{section(fr ? `Meilleurs sous ${limit} $` : `Best Under $${limit}`, under(limit), fr ? 'Classement par Value per Dollar' : 'Ranked by Value per Dollar')}</div>)}
    {section(fr ? '🔇 Meilleur ANC budget' : '🔇 Best Budget ANC', bestAnc, 'ANC Intelligence /100')}
    {section(fr ? '🔋 Meilleure autonomie budget' : '🔋 Best Budget Battery', bestBattery, fr ? 'Autonomie annoncée par écouteur' : 'Rated per-earbud battery life')}
    {section(fr ? '🏃 Meilleurs pour le sport' : '🏃 Best Budget Sport', bestSport, fr ? 'Résistance à l’eau + poids' : 'Water resistance + weight')}
    <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">{fr ? 'Comment nous calculons la valeur' : 'How we calculate value'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{(fr ? [['Sound','30%'],['ANC','20%'],['Calls','15%'],['Comfort','15%'],['Battery','10%'],['Durability','5%'],['Features','5%']] : [['Sound','30%'],['ANC','20%'],['Calls','15%'],['Comfort','15%'],['Battery','10%'],['Durability','5%'],['Features','5%']]).map(([label, weight]) => <div key={label} className="border border-line rounded-xl p-4 bg-panel"><div className="font-mono text-accent text-xs">{weight}</div><div className="font-display font-semibold mt-1">{label}</div></div>)}</div><p className="text-dim text-xs leading-6 mt-4 max-w-3xl">{fr ? 'Le Utility Score est calculé indépendamment du prix. Les critères sans donnée ne sont pas convertis en zéro : leur poids est redistribué entre les critères disponibles. Le Value per Dollar utilise ensuite le ratio Utility / prix et le normalise sur l’ensemble des candidats du guide.' : 'Utility Score is calculated independently of price. Missing criteria are not converted to zero: their weight is redistributed across available criteria. Value per Dollar then uses Utility / price and normalizes it across the guide candidates.'}</p></section>
    <section className="mt-14 grid md:grid-cols-2 gap-4"><div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Pourquoi notre approche est différente' : 'Why our approach is different'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Le meilleur écouteur absolu n’est pas automatiquement le meilleur budget. Un produit plus cher doit apporter suffisamment d’utilité supplémentaire pour justifier son prix. Notre Value per Dollar rend ce compromis visible.' : 'The best overall earbud is not automatically the best budget buy. A more expensive product must deliver enough additional utility to justify its price. Value per Dollar makes that trade-off visible.'}</p></div><div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Besoin d’une recommandation personnalisée ?' : 'Need a personalized recommendation?'}</h2><p className="text-dim text-sm leading-7 mt-3">{fr ? 'Le prix n’est qu’un point de départ. Utilisez le Finder pour trouver le modèle adapté à vos usages.' : 'Price is only a starting point. Use the Finder to find the model that matches your needs.'}</p><Link href="/trouver-mes-ecouteurs" className="inline-block mt-4 text-accent font-mono text-xs uppercase">{fr ? 'Ouvrir le Finder →' : 'Open Finder →'}</Link></div></section>
    <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quel est le meilleur écouteur pas cher ?','Le meilleur choix dépend du budget et des priorités. Notre Value per Dollar cherche le meilleur compromis entre utilité réelle et prix.'],['Quel budget faut-il prévoir ?','50 $ est un bon point de comparaison, mais des modèles intéressants existent sous 30 $ et certains sous 75 ou 100 $ apportent davantage de fonctions.'],['Le score mesure-t-il la qualité sonore ?','Le Utility Score utilise les scores de performance lorsqu’ils sont disponibles et des fallbacks de spécifications pour les dimensions encore non documentées. Il ne remplace pas un test audio de laboratoire.'],['Pourquoi certains modèles n’ont-ils pas de score ?','Les dimensions sans données restent manquantes et leur poids est redistribué. Une absence de donnée n’est donc pas assimilée à une mauvaise performance.']] : [['What are the best cheap earbuds?','The best choice depends on your budget and priorities. Our Value per Dollar looks for the strongest compromise between product utility and price.'],['How much should I spend?','$50 is a useful benchmark, but strong options exist below $30, while models under $75 or $100 can add more features.'],['Does the score measure sound quality?','Utility Score uses performance scores when available and specification fallbacks for dimensions that are not yet documented. It does not replace a laboratory audio test.'],['Why do some models have no score?','Missing dimensions remain missing and their weight is redistributed. Missing data is not treated as poor performance.']]).map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section>
  </article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer /></>;
}
