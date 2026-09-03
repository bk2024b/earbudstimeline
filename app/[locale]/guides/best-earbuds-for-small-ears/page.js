import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;

const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const formatPrice = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;

// A transparent fit index based only on catalog specifications. It is not a physical fit test.
function fitScore(model) {
  const weight = n(model.weight_g);
  const score = weight == null ? null : Math.max(0, Math.min(100, 100 - Math.max(0, weight - 4) * 16));
  return score == null ? null : Math.round(score);
}

function Card({ row, brand, fr }) {
  const { model, score } = row;
  return (
    <Link href={`/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
      <div className="flex justify-between gap-4">
        <div className="min-w-0"><div className="font-mono text-[10px] text-accent uppercase tracking-[.12em]">{brand?.name || model.brand_id}</div><h3 className="font-display font-semibold text-[17px] mt-1">{model.name}</h3></div>
        <div className="text-right shrink-0"><div className="font-display font-bold text-xl">{formatPrice(model.price)}</div><div className="font-mono text-[9px] text-accent mt-1">{fr ? 'Fit' : 'Fit'} {score}/100</div></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono"><div className="border border-line rounded-lg p-2"><span className="text-dim">{fr ? 'Poids' : 'Weight'}</span><strong className="block text-sm mt-1">{n(model.weight_g) ? `${n(model.weight_g)}g` : '—'}</strong></div><div className="border border-line rounded-lg p-2"><span className="text-dim">ANC</span><strong className="block text-sm mt-1">{model.anc ? 'Yes' : 'No'}</strong></div></div>
      <div className="mt-4 pt-3 border-t border-line flex gap-3 flex-wrap text-[10px] font-mono text-dim"><span>{n(model.battery_bud_h) ?? '—'}h</span><span>{model.water_rating || '—'}</span><span>{model.gamme || '—'}</span></div>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour petites oreilles' : 'Best Earbuds for Small Ears';

  // Le pick n°1 change selon la page (chaque guide a sa propre fonction de score
  // ci-dessus), donc l'inclure dans la description rend chaque page unique aux yeux
  // de Google au lieu de répéter un texte quasi identique sur les 22 guides
  // "best-earbuds-for-*". Si la requête échoue, on retombe sur la description
  // générique existante — jamais de meta vide ou cassée.
  let topPickLine = '';
  try {
    const models = await getAllEarbuds();
    const top = [...models].sort((a, b) => fitScore(b) - fitScore(a))[0];
    if (top) topPickLine = fr ? ` Top actuel : ${top.name}.` : ` Current top pick: ${top.name}.`;
  } catch {}

  const description =
    (fr
      ? 'Découvrez les meilleurs écouteurs pour petites oreilles selon le poids et les caractéristiques disponibles dans le catalogue EarbudsTimeline.'
      : 'Find the best earbuds for small ears using weight and available specifications from the EarbudsTimeline catalog.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-small-ears`),
  };
}

export default async function BestEarbudsForSmallEarsPage({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const rows = models.map((model) => ({ model, score: fitScore(model) })).filter((r) => r.score != null).sort((a,b) => b.score-a.score);
  const best = rows.slice(0, 10);
  const under100 = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 100).slice(0,5);
  const light = [...rows].sort((a,b) => n(a.model.weight_g)-n(b.model.weight_g)).slice(0,5);
  const anc = rows.filter((r) => r.model.anc).slice(0,5);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour petites oreilles en ${year}` : `Best Earbuds for Small Ears in ${year}`;
  const intro = fr ? 'Une sélection des modèles les plus légers de notre catalogue pour les utilisateurs qui recherchent un format plus facile à porter. Le score Fit est un indicateur de poids, pas une garantie de confort ou de compatibilité anatomique.' : 'A selection of the lightest models in our catalog for users looking for an easier-to-wear format. The Fit score is a weight-based indicator, not a guarantee of comfort or anatomical compatibility.';
  const jsonLd = { '@context':'https://schema.org','@type':'Article',headline:title,description:intro,url:`https://earbudstimeline.com/${locale}/guides/best-earbuds-for-small-ears`,dateModified: todayIso,inLanguage:locale };
  const section = (heading,items,subtitle) => items.length > 0 && <section className="mt-12"><div className="mb-5"><h2 className="font-display font-semibold text-[25px]">{heading}</h2><p className="text-dim text-sm mt-1">{subtitle}</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(r=><Card key={r.model.id} row={r} brand={brandMap.get(r.model.brand_id)} fr={fr}/>)}</div></section>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[.14em] mb-3">Small Ears · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div>
  <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">{[['overall','OVERALL',best],['under100','UNDER $100',under100],['light','LIGHTEST',light],['anc','ANC',anc]].map(([id,label,items])=><a key={id} href={`#${id}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent"><div className="font-mono text-accent text-xs">{label}</div><div className="font-display font-semibold mt-1">{items.length} picks</div></a>)}</section>
  <section id="overall" className="mt-12"><div className="mb-5"><h2 className="font-display font-semibold text-[25px]">👂 {fr?'Meilleurs écouteurs pour petites oreilles':'Best Earbuds for Small Ears Overall'}</h2><p className="text-dim text-sm mt-1">{fr?'Classés principalement selon le poids disponible dans le catalogue.':'Ranked primarily using weight data available in the catalog.'}</p></div><div className="overflow-x-auto border border-line rounded-2xl bg-panel"><table className="w-full text-left text-xs"><thead className="border-b border-line font-mono text-[10px] text-dim uppercase"><tr><th className="p-4">#</th><th className="p-4">{fr?'Écouteurs':'Earbuds'}</th><th className="p-4">{fr?'Prix':'Price'}</th><th className="p-4">Fit</th><th className="p-4">Weight</th><th className="p-4">ANC</th></tr></thead><tbody>{best.map((r,i)=><tr key={r.model.id} className="border-b border-line last:border-0"><td className="p-4 font-mono text-accent">{i+1}</td><td className="p-4"><Link className="font-semibold hover:text-accent" href={`/ecouteurs/${r.model.id}`}>{r.model.name}</Link><div className="text-dim text-[10px] mt-1">{brandMap.get(r.model.brand_id)?.name || r.model.brand_id}</div></td><td className="p-4 font-mono">{formatPrice(r.model.price)}</td><td className="p-4 font-mono font-bold">{r.score}</td><td className="p-4">{n(r.model.weight_g)}g</td><td className="p-4">{r.model.anc?'✓':'—'}</td></tr>)}</tbody></table></div></section>
  <div id="under100">{section(fr?'💵 Meilleurs écouteurs pour petites oreilles sous 100 $':'💵 Best Earbuds for Small Ears Under $100',under100,fr?'Sélection des modèles sous 100 $.':'Selection of models under $100.')}</div><div id="light">{section(fr?'⚖️ Les écouteurs les plus légers':'⚖️ Lightest Earbuds',light,fr?'Classés par poids.':'Ranked by weight.')}</div><div id="anc">{section(fr?'🔇 Petites oreilles avec ANC':'🔇 Best ANC Earbuds for Small Ears',anc,fr?'Sélection parmi les modèles ANC.':'Selection among ANC models.')}</div>
  <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">{fr?'Ce que le poids ne dit pas':'What weight does not tell you'}</h2><p className="text-dim text-sm leading-7 max-w-3xl">{fr?'Un écouteur léger peut être inconfortable selon la forme du boîtier, l’embout, la profondeur d’insertion et la morphologie de l’oreille. Nous utilisons donc le poids comme proxy transparent et évitons de promettre un ajustement anatomique sans données dédiées.':'A light earbud can still be uncomfortable depending on shell shape, ear tip, insertion depth and ear anatomy. We therefore use weight as a transparent proxy and avoid claiming anatomical fit without dedicated data.'}</p></section>
  <section className="mt-14 grid md:grid-cols-2 gap-4"><div className="border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Guides associés':'Related guides'}</h2><div className="mt-4 space-y-2 text-sm"><Link className="block hover:text-accent" href="/guides/best-wireless-earbuds">→ {fr?'Meilleurs écouteurs sans fil':'Best Wireless Earbuds'}</Link><Link className="block hover:text-accent" href="/guides/best-earbuds-under-100">→ {fr?'Meilleurs écouteurs sous 100 $':'Best Earbuds Under $100'}</Link><Link className="block hover:text-accent" href="/guides/best-noise-cancelling-earbuds">→ {fr?'Meilleurs écouteurs ANC':'Best Noise Cancelling Earbuds'}</Link></div></div><div className="border border-accent/30 rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr?'Explorer le catalogue':'Explore the catalog'}</h2><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href="/ecouteurs">{fr?'Voir le catalogue →':'Browse catalog →'}</Link></div></section>
  <section className="mt-14"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr?[['Quels sont les meilleurs écouteurs pour petites oreilles ?','Nous mettons en avant les modèles les plus légers avec des données de poids disponibles, tout en précisant que le poids ne garantit pas l’ajustement.'],['Un écouteur léger est-il forcément plus confortable ?','Non. La forme, les embouts et la morphologie de l’oreille comptent aussi.'],['Quels écouteurs pour petites oreilles sous 100 $ ?','Consultez la section dédiée sous 100 $ pour voir les modèles correspondants.'],['Le classement teste-t-il réellement la compatibilité avec les petites oreilles ?','Non. Il s’agit d’un proxy basé sur les spécifications disponibles, pas d’un test anatomique.']]:[['What are the best earbuds for small ears?','We highlight lighter models with available weight data while making clear that weight does not guarantee fit.'],['Are lighter earbuds always more comfortable?','No. Shell shape, ear tips and individual ear anatomy also matter.'],['What are the best small-ear earbuds under $100?','See the dedicated under-$100 section for matching models.'],['Does the ranking actually test small-ear compatibility?','No. It is a specification-based proxy, not an anatomical fit test.']]).map(([q,a])=><details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
