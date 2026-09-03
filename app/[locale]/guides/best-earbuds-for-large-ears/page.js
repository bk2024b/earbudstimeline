import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(100, 50 + ((n(m.weight_g) || 99) <= 8 ? 12 : 0) + ((n(m.weight_g) || 99) <= 7 ? 8 : 0) + ((n(m.battery_bud_h) || 0) >= 7 ? 10 : ((n(m.battery_bud_h) || 0) >= 5 ? 5 : 0)) + (m.transparency_mode || m.transparency ? 5 : 0) + (m.anc ? 5 : 0));

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour grandes oreilles' : 'Best Earbuds for Large Ears';

  // Le pick n°1 change selon la page (chaque guide a sa propre fonction de score
  // ci-dessus), donc l'inclure dans la description rend chaque page unique aux yeux
  // de Google au lieu de répéter un texte quasi identique sur les 22 guides
  // "best-earbuds-for-*". Si la requête échoue, on retombe sur la description
  // générique existante — jamais de meta vide ou cassée.
  let topPickLine = '';
  try {
    const models = await getAllEarbuds();
    const top = [...models].sort((a, b) => score(b) - score(a))[0];
    if (top) topPickLine = fr ? ` Top actuel : ${top.name}.` : ` Current top pick: ${top.name}.`;
  } catch {}

  const description =
    (fr
      ? 'Comparez les écouteurs pour grandes oreilles selon poids, autonomie et caractéristiques disponibles.'
      : 'Compare earbuds for large ears using available weight, battery and feature data.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-large-ears`),
  };
}

export default async function Page({ params }) {
  const { locale } = params; const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models.map((model) => ({ model, score: score(model) })).sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10); const budget = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 100).slice(0, 6);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour grandes oreilles en ${year}` : `Best Earbuds for Large Ears in ${year}`;
  const intro = fr ? 'Une sélection orientée confort et usage prolongé pour les personnes recherchant des écouteurs adaptés aux grandes oreilles, basée sur les données disponibles.' : 'A comfort-focused selection for people looking for earbuds suitable for larger ears, based on available data.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-for-large-ears`, dateModified: todayIso, inLanguage: locale };
  const card = ({ model, score: s }) => <Link key={model.id} href={`/${locale}/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-mono text-[10px] text-accent uppercase">{bm.get(model.brand_id)?.name || model.brand_id}</div><div className="flex justify-between gap-4 mt-1"><h3 className="font-display font-semibold">{model.name}</h3><div className="text-right shrink-0"><b>{price(model.price)}</b><div className="font-mono text-[9px] text-accent">{s}/100</div></div></div><div className="mt-4 text-[10px] font-mono text-dim">{n(model.weight_g) != null ? `${n(model.weight_g)}g` : 'Weight —'} · {n(model.battery_bud_h) != null ? `${n(model.battery_bud_h)}h` : 'Battery —'} · {model.anc ? 'ANC' : 'No ANC'}</div></Link>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Large Ears · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div><section className="mt-10"><h2 className="font-display font-semibold text-[25px]">👂 {fr ? 'Meilleurs écouteurs pour grandes oreilles' : 'Best Earbuds for Large Ears Overall'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{best.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">💵 {fr ? 'Meilleurs choix sous 100 $' : 'Best Large-Ear Earbuds Under $100'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{budget.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Taille, poids et confort' : 'Size, weight and comfort'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Les dimensions publiées ne permettent pas toujours de conclure à la compatibilité avec une oreille donnée. Le poids est un indicateur parmi d’autres. Le confort réel dépend de la forme de l’oreille, des embouts et du maintien.' : 'Published dimensions do not always determine compatibility with a specific ear. Weight is one useful indicator among others. Real-world comfort depends on ear shape, eartips and fit.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Choisir les bons embouts' : 'Choosing the right eartips'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Lorsque plusieurs tailles d’embouts sont proposées, les essayer peut aider à obtenir un maintien plus stable et une meilleure isolation.' : 'When multiple eartip sizes are included, trying them can help achieve a more stable fit and better isolation.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le score utilise principalement poids, autonomie, ANC et transparence lorsque ces données sont disponibles. Il ne prétend pas déterminer la compatibilité physique réelle.' : 'The score mainly uses weight, battery life, ANC and transparency when available. It does not claim to determine actual physical fit.'}</p></section><section className="mt-12 border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Guides associés' : 'Related guides'}</h2><div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm"><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-small-ears`}>→ Best Earbuds for Small Ears</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-sleep`}>→ Best Earbuds for Sleep</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-working`}>→ Best Earbuds for Working</Link></div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs pour grandes oreilles ?','Il n’existe pas un modèle universel. Le confort dépend de la forme de l’oreille, des embouts et du maintien.'],['Le poids est-il important ?','Il peut contribuer au confort sur de longues périodes, mais ne suffit pas à déterminer le confort global.'],['Comment savoir si des écouteurs conviendront ?','Vérifiez les dimensions et les embouts disponibles et, si possible, privilégiez une politique de retour adaptée.']] : [['What are the best earbuds for large ears?','There is no universal model. Comfort depends on ear shape, eartips and fit.'],['Does weight matter?','It can contribute to long-term comfort, but it does not determine overall comfort by itself.'],['How can you tell if earbuds will fit?','Check dimensions and included eartips and, when possible, choose a suitable return policy.']]).map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
