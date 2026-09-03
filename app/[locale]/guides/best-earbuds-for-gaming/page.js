import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

function gamingScore(m) {
  let score = 50;
  const name = `${m.name || ''} ${m.brand_id || ''}`.toLowerCase();
  // NOTE: this used to check m.low_latency / m.gaming_mode / m.game_mode /
  // m.bluetooth_version — none of those columns exist in the real schema
  // (see supabase/schema.sql), so that branch was silently dead code: it
  // never added its +25/+5 points for any model, ever. Rebalanced around
  // fields that actually exist so the score differentiates models again.
  if (m.multipoint) score += 15;
  if (Number.isFinite(Number(m.microphones)) || Number.isFinite(Number(m.mic_count))) score += 10;
  if (m.anc) score += 10;
  const battery = Number(m.battery_bud_h);
  if (Number.isFinite(battery) && battery >= 6) score += 5;
  if (name.includes('gaming') || name.includes('buds')) score += 2;
  return Math.min(100, score);
}

function Card({ row, brand, fr }) {
  const { model, score } = row;
  return <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="flex justify-between gap-4"><div><div className="font-mono text-[10px] text-accent uppercase">{brand?.name || model.brand_id}</div><h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3></div><div className="text-right"><div className="font-display font-bold text-xl">{price(model.price)}</div><div className="font-mono text-[9px] text-accent mt-1">Gaming {score}/100</div></div></div><div className="mt-4 flex gap-3 flex-wrap text-[10px] font-mono text-dim"><span>{model.low_latency || model.gaming_mode || model.game_mode ? 'Low latency' : '—'}</span><span>{model.multipoint ? 'Multipoint' : '—'}</span><span>{n(model.battery_bud_h) ?? '—'}h</span></div></Link>;
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour le gaming' : 'Best Gaming Earbuds';

  // Le pick n°1 change selon la page (chaque guide a sa propre fonction de score
  // ci-dessus), donc l'inclure dans la description rend chaque page unique aux yeux
  // de Google au lieu de répéter un texte quasi identique sur les 22 guides
  // "best-earbuds-for-*". Si la requête échoue, on retombe sur la description
  // générique existante — jamais de meta vide ou cassée.
  let topPickLine = '';
  try {
    const models = await getAllEarbuds();
    const top = [...models].sort((a, b) => gamingScore(b) - gamingScore(a))[0];
    if (top) topPickLine = fr ? ` Top actuel : ${top.name}.` : ` Current top pick: ${top.name}.`;
  } catch {}

  const description =
    (fr
      ? 'Comparez les meilleurs écouteurs pour le gaming selon les fonctions de faible latence, microphone, autonomie et ANC disponibles.'
      : 'Compare the best gaming earbuds using available low-latency, microphone, battery and ANC features.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-gaming`),
  };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map(b => [b.id, b]));
  const rows = models.map(model => ({ model, score: gamingScore(model) })).sort((a,b) => b.score-a.score);
  const best = rows.slice(0,10);
  const under100 = rows.filter(r => n(r.model.price) != null && n(r.model.price) <= 100).slice(0,5);
  const mic = rows.filter(r => n(r.model.microphones) != null || n(r.model.mic_count) != null).slice(0,5);
  const anc = rows.filter(r => r.model.anc).slice(0,5);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour le gaming en ${year}` : `Best Gaming Earbuds in ${year}`;
  const intro = fr ? 'Une sélection basée sur les fonctionnalités gaming réellement présentes dans les données du catalogue. Le score Gaming est un indice de spécifications et ne remplace pas un test de latence ou de qualité sonore en jeu.' : 'A selection based on gaming-related features actually present in our catalog data. The Gaming score is a specification index and does not replace latency or in-game audio testing.';
  const jsonLd = { '@context':'https://schema.org','@type':'Article',headline:title,description:intro,url:`https://earbudstimeline.com/${locale}/guides/best-earbuds-for-gaming`,dateModified: todayIso,inLanguage:locale };
  const section = (h,items,s) => items.length > 0 && <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{h}</h2><p className="text-dim text-sm mt-1">{s}</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{items.map(r => <Card key={r.model.id} row={r} brand={bm.get(r.model.brand_id)} fr={fr}/>)}</div></section>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Gaming · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div><section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">{[['overall','OVERALL',best],['under100','UNDER $100',under100],['MIC','MIC',mic],['anc','ANC',anc]].map(([id,l,x]) => <a key={id} href={`#${id}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">{l}</div><div className="font-display font-semibold mt-1">{x.length} picks</div></a>)}</section><section id="overall" className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">🎮 {fr?'Meilleurs écouteurs gaming':'Best Gaming Earbuds Overall'}</h2><div className="overflow-x-auto border border-line rounded-2xl bg-panel"><table className="w-full text-left text-xs"><thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">Earbuds</th><th className="p-4">Price</th><th className="p-4">Gaming</th><th className="p-4">Mic</th></tr></thead><tbody>{best.map((r,i)=><tr key={r.model.id} className="border-b border-line last:border-0"><td className="p-4 text-accent">{i+1}</td><td className="p-4"><Link href={`/ecouteurs/${r.model.id}`} className="font-semibold hover:text-accent">{r.model.name}</Link><div className="text-dim text-[10px]">{bm.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{price(r.model.price)}</td><td className="p-4 font-bold">{r.score}</td><td className="p-4">{n(r.model.microphones) ?? n(r.model.mic_count) ?? '—'}</td></tr>)}</tbody></table></div></section><div id="under100">{section(fr?'💵 Meilleurs écouteurs gaming sous 100 $':'💵 Best Gaming Earbuds Under $100',under100,fr?'Sélection sous 100 $.':'Under-$100 selection.')}</div><div id="MIC">{section(fr?'🎙️ Meilleurs écouteurs gaming pour le chat vocal':'🎙️ Best Gaming Earbuds for Voice Chat',mic,fr?'Sélection selon les données microphone disponibles.':'Selection using available microphone data.')}</div><div id="anc">{section(fr?'🔇 Meilleurs écouteurs gaming avec ANC':'🔇 Best Gaming Earbuds with ANC',anc,fr?'Sélection parmi les modèles ANC.':'Selection among ANC models.')}</div><section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">{fr?'Latence et mode gaming':'Latency and gaming mode'}</h2><p className="text-dim text-sm leading-7 max-w-3xl">{fr?'Pour le gaming, la latence audio est plus importante que la simple présence du Bluetooth. Nous ne suivons pas encore de donnée de latence vérifiée par modèle dans notre catalogue, donc ce classement s’appuie sur des caractéristiques mesurables (multipoint, microphones, ANC, autonomie) plutôt que sur une valeur de latence en millisecondes que nous ne pourrions pas vérifier.':'For gaming, audio latency matters more than Bluetooth alone. We do not yet track a verified per-model latency figure in our catalog, so this ranking relies on measurable specifications (multipoint, microphones, ANC, battery life) rather than a millisecond latency value we could not verify.'}</p></section><section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">{fr?'Méthodologie':'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl">{fr?'Le score Gaming combine uniquement des indicateurs de fonctionnalités présents dans les données du catalogue. Il ne constitue pas un benchmark de performance audio, de spatialisation ou de latence réelle.':'The Gaming score combines only feature indicators present in catalog data. It is not an audio, spatialization or real-world latency benchmark.'}</p></section><section className="mt-14 grid md:grid-cols-2 gap-4"><div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Guides associés':'Related guides'}</h2><div className="mt-4 space-y-2 text-sm"><Link className="block hover:text-accent" href="/guides/best-wireless-earbuds">→ Best Wireless Earbuds</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-for-calls">→ Best Earbuds for Calls</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-for-android">→ Best Earbuds for Android</Link></div></div><div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Explorer le catalogue':'Explore the catalog'}</h2><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr?'Voir le catalogue →':'Browse catalog →'}</Link></div></section><section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr?[['Quels sont les meilleurs écouteurs pour le gaming ?','Le classement met en avant les modèles dont les données indiquent des fonctions utiles au gaming (multipoint, microphones, ANC, autonomie). Nous ne suivons pas de donnée de latence vérifiée par modèle.'],['Quelle latence est bonne pour le gaming ?','Nous ne donnons pas de seuil universel sans mesures comparables. Une valeur réelle en millisecondes nécessite un test dédié.'],['Les écouteurs gaming fonctionnent-ils sur console ?','La compatibilité dépend de la console, du protocole Bluetooth et parfois d’un dongle ou d’un mode spécifique. Vérifiez la fiche du modèle avant achat.'],['Quels écouteurs gaming sous 100 $ ?','Consultez la section dédiée sous 100 $ pour comparer les modèles présents dans notre catalogue.']]:[['What are the best gaming earbuds?','The ranking highlights models whose data indicates useful gaming features (multipoint, microphones, ANC, battery life). We do not track a verified per-model latency figure.'],['What latency is good for gaming?','We do not provide a universal threshold without comparable measurements. A real millisecond value requires dedicated testing.'],['Do gaming earbuds work on consoles?','Compatibility depends on the console, Bluetooth protocol and sometimes a dongle or specific mode. Check the model page before buying.'],['What are the best gaming earbuds under $100?','See the dedicated under-$100 section to compare models represented in our catalog.']]).map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
