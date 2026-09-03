import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

function iphoneScore(m) {
  let score = 55;
  const name = `${m.name || ''} ${m.brand_id || ''}`.toLowerCase();
  if (m.anc) score += 10;
  if (m.multipoint) score += 8;
  if (m.app_support || m.companion_app || m.app) score += 8;
  if (m.codec || m.codecs) score += 4;
  if (m.fast_pair || m.google_fast_pair) score -= 3;
  if (name.includes('airpods') || name.includes('beats')) score += 10;
  return Math.max(0, Math.min(100, score));
}

function Card({ row, brand, fr }) {
  const { model, score } = row;
  return <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="flex justify-between gap-4"><div><div className="font-mono text-[10px] text-accent uppercase">{brand?.name || model.brand_id}</div><h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3></div><div className="text-right"><div className="font-display font-bold text-xl">{price(model.price)}</div><div className="font-mono text-[9px] text-accent mt-1">iPhone {score}/100</div></div></div><div className="mt-4 flex gap-3 flex-wrap text-[10px] font-mono text-dim"><span>{model.anc ? 'ANC' : 'No ANC'}</span><span>{model.multipoint ? 'Multipoint' : '—'}</span><span>{n(model.battery_bud_h) ?? '—'}h</span></div></Link>;
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour iPhone' : 'Best Earbuds for iPhone';

  // Le pick n°1 change selon la page (chaque guide a sa propre fonction de score
  // ci-dessus), donc l'inclure dans la description rend chaque page unique aux yeux
  // de Google au lieu de répéter un texte quasi identique sur les 22 guides
  // "best-earbuds-for-*". Si la requête échoue, on retombe sur la description
  // générique existante — jamais de meta vide ou cassée.
  let topPickLine = '';
  try {
    const models = await getAllEarbuds();
    const top = [...models].sort((a, b) => iphoneScore(b) - iphoneScore(a))[0];
    if (top) topPickLine = fr ? ` Top actuel : ${top.name}.` : ` Current top pick: ${top.name}.`;
  } catch {}

  const description =
    (fr
      ? 'Comparez les meilleurs écouteurs pour iPhone selon les fonctionnalités disponibles, l’ANC, l’autonomie et le prix.'
      : 'Compare the best earbuds for iPhone using available features, ANC, battery life and price.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-iphone`),
  };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map(b => [b.id, b]));
  const rows = models.map(model => ({ model, score: iphoneScore(model) })).sort((a,b) => b.score-a.score);
  const best = rows.slice(0,10);
  const under100 = rows.filter(r => n(r.model.price) != null && n(r.model.price) <= 100).slice(0,5);
  const anc = rows.filter(r => r.model.anc).slice(0,5);
  const apple = rows.filter(r => `${r.model.name} ${r.model.brand_id}`.toLowerCase().includes('airpods') || `${r.model.name} ${r.model.brand_id}`.toLowerCase().includes('beats')).slice(0,5);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour iPhone en ${year}` : `Best Earbuds for iPhone in ${year}`;
  const intro = fr ? 'Une sélection basée sur les fonctionnalités disponibles dans notre catalogue et les caractéristiques pertinentes pour un usage avec iPhone. Le score iPhone est un indice de spécifications et ne garantit pas toutes les fonctions propriétaires Apple.' : 'A selection based on features available in our catalog and characteristics relevant to iPhone use. The iPhone score is a specification index and does not guarantee every Apple proprietary feature.';
  const jsonLd = { '@context':'https://schema.org','@type':'Article',headline:title,description:intro,url:`https://earbudstimeline.com/${locale}/guides/best-earbuds-for-iphone`,dateModified: todayIso,inLanguage:locale };
  const section = (h,items,s) => items.length > 0 && <section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{h}</h2><p className="text-dim text-sm mt-1">{s}</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{items.map(r => <Card key={r.model.id} row={r} brand={bm.get(r.model.brand_id)} fr={fr}/>)}</div></section>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">iPhone · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div><section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">{[['overall','OVERALL',best],['under100','UNDER $100',under100],['anc','ANC',anc],['APPLE','APPLE/BEATS',apple]].map(([id,l,x]) => <a key={id} href={`#${id}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">{l}</div><div className="font-display font-semibold mt-1">{x.length} picks</div></a>)}</section><section id="overall" className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">🍎 {fr?'Meilleurs écouteurs pour iPhone':'Best Earbuds for iPhone Overall'}</h2><div className="overflow-x-auto border border-line rounded-2xl bg-panel"><table className="w-full text-left text-xs"><thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">Earbuds</th><th className="p-4">Price</th><th className="p-4">iPhone</th><th className="p-4">ANC</th><th className="p-4">Multipoint</th></tr></thead><tbody>{best.map((r,i) => <tr key={r.model.id} className="border-b border-line last:border-0"><td className="p-4 text-accent">{i+1}</td><td className="p-4"><Link href={`/ecouteurs/${r.model.id}`} className="font-semibold hover:text-accent">{r.model.name}</Link><div className="text-dim text-[10px]">{bm.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{price(r.model.price)}</td><td className="p-4 font-bold">{r.score}</td><td className="p-4">{r.model.anc?'✓':'—'}</td><td className="p-4">{r.model.multipoint?'✓':'—'}</td></tr>)}</tbody></table></div></section><div id="under100">{section(fr?'💵 Meilleurs écouteurs pour iPhone sous 100 $':'💵 Best iPhone Earbuds Under $100',under100,fr?'Sélection sous 100 $.':'Under-$100 selection.')}</div><div id="anc">{section(fr?'🔇 Meilleurs écouteurs ANC pour iPhone':'🔇 Best ANC Earbuds for iPhone',anc,fr?'Sélection parmi les modèles ANC.':'Selection among ANC models.')}</div><div id="APPLE">{section(fr?'🍎 Écouteurs Apple et Beats pour iPhone':'🍎 Apple and Beats Earbuds for iPhone',apple,fr?'Sélection des modèles Apple/Beats présents dans le catalogue.':'Selection of Apple/Beats models represented in the catalog.')}</div><section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">{fr?'Méthodologie':'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl">{fr?'Le score iPhone combine uniquement des indicateurs de fonctionnalités présents dans les données du catalogue. Nous ne transformons pas l’absence de données en garantie de compatibilité et nous distinguons les fonctions Bluetooth générales des fonctions propriétaires Apple.':'The iPhone score combines only feature indicators present in catalog data. Missing data is not turned into compatibility guarantees, and general Bluetooth features are distinguished from Apple proprietary features.'}</p></section><section className="mt-14 grid md:grid-cols-2 gap-4"><div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Guides associés':'Related guides'}</h2><div className="mt-4 space-y-2 text-sm"><Link className="block hover:text-accent" href="/guides/best-wireless-earbuds">→ Best Wireless Earbuds</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-for-android">→ Best Earbuds for Android</Link><Link className="block hover:text-accent" href="/guides/best-noise-cancelling-earbuds">→ Best Noise Cancelling Earbuds</Link></div></div><div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Explorer le catalogue':'Explore the catalog'}</h2><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr?'Voir le catalogue →':'Browse catalog →'}</Link></div></section><section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr?[['Quels sont les meilleurs écouteurs pour iPhone ?','Le classement compare les fonctionnalités disponibles et pertinentes pour iPhone dans notre catalogue.'],['Les écouteurs Bluetooth fonctionnent-ils avec iPhone ?','La connexion Bluetooth de base est généralement possible, mais certaines fonctions avancées dépendent du modèle et de son intégration logicielle.'],['Les AirPods sont-ils les seuls bons écouteurs pour iPhone ?','Non. De nombreux écouteurs tiers fonctionnent avec iPhone, même si certaines fonctions Apple propriétaires peuvent manquer.'],['Quel est le meilleur ANC pour iPhone ?','Consultez notre classement ANC dédié pour comparer les modèles selon les données ANC disponibles.']]:[['What are the best earbuds for iPhone?','The ranking compares available features relevant to iPhone use in our catalog.'],['Do Bluetooth earbuds work with iPhone?','Basic Bluetooth connectivity is generally possible, but advanced features depend on the model and software integration.'],['Are AirPods the only good earbuds for iPhone?','No. Many third-party earbuds work with iPhone, although some Apple proprietary features may be unavailable.'],['What are the best ANC earbuds for iPhone?','See our dedicated ANC ranking to compare models using available ANC data.']]).map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
