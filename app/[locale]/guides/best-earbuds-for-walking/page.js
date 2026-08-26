import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(100, 50 + (m.transparency_mode || m.transparency ? 15 : 0) + (m.anc ? 6 : 0) + ((n(m.battery_bud_h) || 0) >= 7 ? 12 : ((n(m.battery_bud_h) || 0) >= 5 ? 6 : 0)) + ((n(m.weight_g) || 99) <= 7 ? 10 : 0) + (String(m.water_resistance || m.ip_rating || '').trim() ? 7 : 0));

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Meilleurs écouteurs pour marcher en 2026' : 'Best Earbuds for Walking in 2026';
  return { title: `${title} | EarbudsTimeline`, description: locale === 'fr' ? 'Comparez les écouteurs pour la marche selon confort, autonomie, transparence et résistance disponibles.' : 'Compare earbuds for walking using available comfort, battery, transparency and resistance factors.', ...canonicalFor(`/${locale}/guides/best-earbuds-for-walking`) };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models.map((model) => ({ model, score: score(model) })).sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10);
  const budget = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 100).slice(0, 6);
  const title = fr ? 'Meilleurs écouteurs pour marcher en 2026' : 'Best Earbuds for Walking in 2026';
  const intro = fr ? 'Une sélection pour les promenades et la marche quotidienne, basée sur autonomie, poids, transparence et résistance lorsqu’elles sont disponibles.' : 'A selection for walks and everyday walking based on battery life, weight, transparency and resistance when available.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-for-walking`, dateModified: '2026-08-26', inLanguage: locale };
  const card = (r) => (
    <Link key={r.model.id} href={`/${locale}/ecouteurs/${r.model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent">
      <div className="font-mono text-[10px] text-accent">{bm.get(r.model.brand_id)?.name || r.model.brand_id}</div>
      <div className="flex justify-between gap-4 mt-1"><h3 className="font-display font-semibold">{r.model.name}</h3><div className="text-right"><b>{price(r.model.price)}</b><div className="font-mono text-[9px] text-accent">{r.score}/100</div></div></div>
      <div className="mt-4 text-[10px] font-mono text-dim">{r.model.transparency_mode || r.model.transparency ? 'Transparency · ' : ''}{n(r.model.battery_bud_h) != null ? `${n(r.model.battery_bud_h)}h` : 'Battery —'} · {n(r.model.weight_g) != null ? `${n(r.model.weight_g)}g` : 'Weight —'}</div>
    </Link>
  );
  return (
    <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto">
      <div className="font-mono text-xs text-accent uppercase mb-3">Walking · 2026</div>
      <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
      <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>
      <div className="mt-4 text-[10px] font-mono text-dim">{fr ? 'Dernière mise à jour : 26 août 2026' : 'Last updated: August 26, 2026'}</div>
      <section className="mt-10"><h2 className="font-display font-semibold text-[25px]">🚶 {fr ? 'Meilleurs écouteurs pour marcher' : 'Best Earbuds for Walking Overall'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{best.map(card)}</div></section>
      <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">💵 {fr ? 'Meilleurs choix sous 100 $' : 'Best Walking Earbuds Under $100'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{budget.map(card)}</div></section>
      <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">👂 {fr ? 'Confort et maintien' : 'Comfort and fit'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Pour la marche, le confort sur de longues périodes et un maintien stable peuvent être plus importants que des fonctions avancées. Le confort réel varie selon la forme de l’oreille et les embouts.' : 'For walking, long-term comfort and stable fit can matter more than advanced features. Real-world comfort varies with ear shape and eartips.'}</p></section>
      <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">🌳 {fr ? 'Transparence pour les promenades' : 'Transparency for outdoor walks'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le mode transparence peut permettre d’entendre davantage l’environnement sans retirer les écouteurs. Il ne remplace toutefois pas l’attention nécessaire lors des déplacements.' : 'Transparency mode can make it easier to hear more of your surroundings without removing the earbuds. It does not replace awareness while moving around.'}</p></section>
      <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le score combine transparence, ANC, autonomie, poids et données disponibles sur la résistance. Il s’agit d’un indicateur basé sur les spécifications.' : 'The score combines transparency, ANC, battery life, weight and available resistance data. It is a specification-based indicator.'}</p></section>
      <section className="mt-12 border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Guides associés' : 'Related guides'}</h2><div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm"><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-sport`}>→ Best Earbuds for Sport</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-running`}>→ Best Earbuds for Running</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-outdoor-use`}>→ Best Earbuds for Outdoor Use</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-travel`}>→ Best Earbuds for Travel</Link></div></section>
      <section className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs pour marcher ?','Les modèles légers avec une bonne autonomie et un mode transparence peuvent être pratiques pour la marche.'],['La transparence est-elle utile pour marcher ?','Elle peut aider à entendre davantage l’environnement sans retirer les écouteurs, selon le modèle et la situation.'],['Faut-il des écouteurs résistants à l’eau pour marcher ?','Cela peut être utile sous la pluie ou lors d’activités extérieures, mais le niveau de protection dépend du modèle.']] : [['What are the best earbuds for walking?','Lightweight models with good battery life and transparency mode can be practical for walking.'],['Is transparency useful for walking?','It can make it easier to hear your surroundings without removing the earbuds, depending on the model and situation.'],['Do you need water-resistant earbuds for walking?','They can be useful in rain or outdoor activities, but the protection level depends on the model.']]).map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section>
    </article><Footer/></>
  );
}
