import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(100, 45 + (m.anc ? 25 : 0) + (m.transparency_mode || m.transparency ? 6 : 0) + ((n(m.battery_bud_h) || 0) >= 8 ? 15 : ((n(m.battery_bud_h) || 0) >= 6 ? 8 : 0)) + ((n(m.weight_g) || 99) <= 7 ? 6 : 0) + (String(m.bluetooth_codecs || m.codecs || '').trim() ? 3 : 0));

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour les longs vols' : 'Best Earbuds for Long Flights';

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
      ? 'Comparez les écouteurs pour les longs vols selon ANC, autonomie, poids et transparence.'
      : 'Compare earbuds for long flights using ANC, battery life, weight and transparency.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-long-flights`),
  };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models.map((model) => ({ model, score: score(model) })).sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10);
  const budget = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 150).slice(0, 6);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour les longs vols en ${year}` : `Best Earbuds for Long Flights in ${year}`;
  const intro = fr ? 'Une sélection pour les longs trajets aériens, basée sur ANC, autonomie, poids et fonctionnalités disponibles dans notre catalogue.' : 'A selection for long-haul flights based on ANC, battery life, weight and available features in our catalog.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-for-long-flights`, dateModified: todayIso, inLanguage: locale };
  const card = ({ model, score: s }) => <Link key={model.id} href={`/${locale}/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-mono text-[10px] text-accent uppercase">{bm.get(model.brand_id)?.name || model.brand_id}</div><div className="flex justify-between gap-4 mt-1"><h3 className="font-display font-semibold">{model.name}</h3><div className="text-right shrink-0"><b>{price(model.price)}</b><div className="font-mono text-[9px] text-accent">{s}/100</div></div></div><div className="mt-4 text-[10px] font-mono text-dim">{model.anc ? 'ANC · ' : ''}{n(model.battery_bud_h) != null ? `${n(model.battery_bud_h)}h` : 'Battery —'} · {n(model.weight_g) != null ? `${n(model.weight_g)}g` : 'Weight —'}</div></Link>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Long Flights · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div><section className="mt-10"><h2 className="font-display font-semibold text-[25px]">✈️ {fr ? 'Meilleurs écouteurs pour longs vols' : 'Best Earbuds for Long Flights Overall'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{best.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">💵 {fr ? 'Meilleurs choix jusqu’à 150 $' : 'Best Long-Flight Earbuds Under $150'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{budget.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">🔇 {fr ? 'Pourquoi l’ANC est utile en avion' : 'Why ANC matters on flights'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'L’ANC peut aider à réduire certains bruits ambiants continus, notamment le bruit de fond d’une cabine. Son efficacité varie selon le modèle et le type de bruit.' : 'ANC can help reduce some continuous ambient noise, including cabin background noise. Effectiveness varies by model and noise type.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">🔋 {fr ? 'Autonomie pour un long trajet' : 'Battery life for long trips'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Une longue autonomie limite les recharges pendant le vol. Pensez aussi à l’autonomie avec ANC activé et à la capacité du boîtier.' : 'Long battery life reduces charging interruptions during a flight. Consider runtime with ANC enabled and case capacity.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le score combine ANC, autonomie, transparence, poids et données de codecs lorsqu’elles sont disponibles. Il s’agit d’un indicateur de caractéristiques et non d’un test en cabine.' : 'The score combines ANC, battery life, transparency, weight and available codec data. It is a specification indicator, not an in-cabin test.'}</p></section><section className="mt-12 border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Guides associés' : 'Related guides'}</h2><div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm"><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-travel`}>→ Best Earbuds for Travel</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-noise-cancelling-earbuds`}>→ Best Noise Cancelling Earbuds</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-battery-life-earbuds`}>→ Best Battery Life Earbuds</Link></div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs pour un long vol ?','Les modèles avec ANC, bonne autonomie et poids raisonnable peuvent être pratiques pour les longs vols.'],['Combien d’autonomie faut-il ?','Une autonomie élevée réduit les recharges, mais l’autonomie réelle varie selon le volume, l’ANC et les appels.'],['L’ANC est-il important dans un avion ?','Il peut aider à réduire certains bruits continus de cabine, selon le modèle et l’environnement.']] : [['What are the best earbuds for a long flight?','Models with ANC, good battery life and reasonable weight can be practical for long flights.'],['How much battery life do you need?','Longer runtime reduces charging, but real-world battery life varies with volume, ANC and calls.'],['Is ANC important on a plane?','It can help reduce some continuous cabin noise depending on the model and environment.']]).map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
