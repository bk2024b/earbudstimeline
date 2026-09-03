import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';
import { fmtDate } from '@/lib/format';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(100, 50 + (String(m.bluetooth_codecs || m.codecs || '').trim() ? 10 : 0) + (String(m.driver_size || m.driver || '').trim() ? 8 : 0) + (m.anc ? 7 : 0) + (m.transparency_mode || m.transparency ? 5 : 0) + ((n(m.battery_bud_h) || 0) >= 7 ? 8 : ((n(m.battery_bud_h) || 0) >= 5 ? 4 : 0)) + ((n(m.weight_g) || 99) <= 7 ? 5 : 0));

export async function generateMetadata({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const year = new Date().getFullYear();
  const titleBase = fr ? 'Meilleurs écouteurs pour audiophiles' : 'Best Earbuds for Audiophiles';

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
      ? 'Comparez les écouteurs pour audiophiles selon les spécifications audio disponibles.'
      : 'Compare earbuds for audiophiles using available audio specifications.') + topPickLine;

  return {
    title: `${titleBase} ${fr ? 'en' : 'in'} ${year} | EarbudsTimeline`,
    description,
    ...canonicalFor(`/${locale}/guides/best-earbuds-for-audiophiles`),
  };
}

export default async function Page({ params }) {
  const { locale } = params; const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models.map((model) => ({ model, score: score(model) })).sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10); const budget = rows.filter((r) => n(r.model.price) != null && n(r.model.price) <= 200).slice(0, 6);
  const year = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const updatedLabel = fmtDate(todayIso, locale);
  const title = fr ? `Meilleurs écouteurs pour audiophiles en ${year}` : `Best Earbuds for Audiophiles in ${year}`;
  const intro = fr ? 'Une sélection destinée aux auditeurs exigeants, basée sur les caractéristiques disponibles dans notre catalogue. Les spécifications seules ne permettent pas de mesurer la qualité sonore réelle.' : 'A selection for demanding listeners based on specifications available in our catalog. Specifications alone cannot measure real-world sound quality.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-for-audiophiles`, dateModified: todayIso, inLanguage: locale };
  const card = ({ model, score: s }) => <Link key={model.id} href={`/${locale}/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-mono text-[10px] text-accent uppercase">{bm.get(model.brand_id)?.name || model.brand_id}</div><div className="flex justify-between gap-4 mt-1"><h3 className="font-display font-semibold">{model.name}</h3><div className="text-right shrink-0"><b>{price(model.price)}</b><div className="font-mono text-[9px] text-accent">{s}/100</div></div></div><div className="mt-4 text-[10px] font-mono text-dim">{model.anc ? 'ANC · ' : ''}{model.bluetooth_codecs || model.codecs || 'Codec —'} · {n(model.battery_bud_h) != null ? `${n(model.battery_bud_h)}h` : 'Battery —'}</div></Link>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Audiophile · {year}</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? `Dernière mise à jour : ${updatedLabel}` : `Last updated: ${updatedLabel}`}</div><section className="mt-10"><h2 className="font-display font-semibold text-[25px]">🎧 {fr ? 'Meilleurs écouteurs pour audiophiles' : 'Best Earbuds for Audiophiles Overall'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{best.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">💵 {fr ? 'Meilleurs choix jusqu’à 200 $' : 'Best Audiophile Earbuds Under $200'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{budget.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Ce qui compte vraiment pour un audiophile' : 'What matters for audiophiles'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Codec, pilote, accordage, réponse en fréquence, distorsion, égalisation et qualité du joint peuvent tous influencer l’écoute. Une fiche technique ne remplace toutefois pas des mesures fiables et une écoute réelle.' : 'Codec, driver, tuning, frequency response, distortion, EQ and ear seal can all affect listening. A specification sheet does not replace reliable measurements and real-world listening.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le score combine uniquement les données disponibles sur codecs, pilotes, ANC, transparence, autonomie et poids. Il ne prétend pas mesurer la fidélité sonore ou la préférence personnelle.' : 'The score only combines available codec, driver, ANC, transparency, battery and weight data. It does not claim to measure sound fidelity or personal preference.'}</p></section><section className="mt-12 border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Guides associés' : 'Related guides'}</h2><div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm"><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-music`}>→ Best Earbuds for Music</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-earbuds-for-bass`}>→ Best Earbuds for Bass</Link><Link className="hover:text-accent" href={`/${locale}/guides/best-noise-cancelling-earbuds`}>→ Best Noise Cancelling Earbuds</Link></div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px] mb-5">FAQ</h2><div className="divide-y divide-line border-y border-line">{(fr ? [['Quels sont les meilleurs écouteurs pour audiophiles ?','Cela dépend de la signature sonore recherchée et des mesures disponibles. Les spécifications seules ne suffisent pas.'],['Un codec haut de gamme garantit-il un meilleur son ?','Non. Le codec est un élément de la chaîne audio et ne garantit pas à lui seul une meilleure restitution.'],['Les écouteurs sans fil peuvent-ils convenir aux audiophiles ?','Oui, selon les attentes. Les mesures et l’écoute restent déterminantes.']] : [['What are the best earbuds for audiophiles?','It depends on the desired sound signature and available measurements. Specifications alone are not enough.'],['Does a high-end codec guarantee better sound?','No. Codec choice is one part of the audio chain and does not by itself guarantee better reproduction.'],['Can wireless earbuds satisfy audiophiles?','Yes, depending on expectations. Measurements and listening remain important.']]).map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-display font-medium">{q}</summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
