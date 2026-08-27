import Link from 'next/link';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import AdSlot from '@/components/AdSlot';

export const revalidate = 3600;
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const price = (v) => n(v) == null ? '—' : `$${Math.round(n(v))}`;
const score = (m) => Math.min(100, 45 + (n(m.price) <= 50 ? 18 : 8) + (m.anc ? 10 : 0) + (m.transparency_mode || m.transparency ? 7 : 0) + ((n(m.battery_bud_h) || 0) >= 7 ? 10 : ((n(m.battery_bud_h) || 0) >= 5 ? 5 : 0)) + ((n(m.weight_g) || 99) <= 8 ? 8 : 0) + (String(m.water_resistance || m.ip_rating || m.water_rating || '').trim() ? 7 : 0));

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Meilleurs écouteurs à moins de 75 $ en 2026' : 'Best Earbuds Under $75 in 2026';
  return { title: `${title} | EarbudsTimeline`, description: locale === 'fr' ? 'Comparez les meilleurs écouteurs sans fil à moins de 75 $ selon prix, autonomie et fonctionnalités.' : 'Compare the best wireless earbuds under $75 for price, battery life and features.', ...canonicalFor(`/${locale}/guides/best-earbuds-under-75`) };
}

export default async function Page({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const bm = new Map(brands.map((b) => [b.id, b]));
  const rows = models.filter((m) => n(m.price) != null && n(m.price) > 0 && n(m.price) <= 75).map((model) => ({ model, score: score(model) })).sort((a, b) => b.score - a.score);
  const best = rows.slice(0, 10);
  const title = fr ? 'Meilleurs écouteurs à moins de 75 $ en 2026' : 'Best Earbuds Under $75 in 2026';
  const intro = fr ? 'Une sélection dynamique des meilleurs écouteurs à 75 $ ou moins dans notre catalogue, basée sur les caractéristiques disponibles.' : 'A dynamic selection of the best earbuds priced at $75 or less in our catalog, based on available specifications.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: intro, url: `https://earbudstimeline.com/${locale}/guides/best-earbuds-under-75`, dateModified: '2026-08-26', inLanguage: locale };
  const card = ({ model, score: s }) => <Link key={model.id} href={`/${locale}/ecouteurs/${model.id}`} className="block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-mono text-[10px] text-accent uppercase">{bm.get(model.brand_id)?.name || model.brand_id}</div><div className="flex justify-between gap-4 mt-1"><h3 className="font-display font-semibold">{model.name}</h3><div className="text-right shrink-0"><b>{price(model.price)}</b><div className="font-mono text-[9px] text-accent">{s}/100</div></div></div><div className="mt-4 text-[10px] font-mono text-dim">{model.anc ? 'ANC · ' : ''}{model.transparency_mode || model.transparency ? 'Transparency · ' : ''}{n(model.battery_bud_h) != null ? `${n(model.battery_bud_h)}h` : 'Battery —'} · {n(model.weight_g) != null ? `${n(model.weight_g)}g` : 'Weight —'}</div></Link>;
  return <><JsonLd data={jsonLd}/><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Under $75 · 2026</div><h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p><div className="mt-4 text-[10px] font-mono text-dim">{fr ? 'Dernière mise à jour : 26 août 2026' : 'Last updated: August 26, 2026'}</div><section className="mt-10"><h2 className="font-display font-semibold text-[25px]">💰 {fr ? 'Meilleurs écouteurs sous 75 $' : 'Best Earbuds Under $75 Overall'}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{best.map(card)}</div></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'À quoi s’attendre sous 75 $' : 'What to expect under $75'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Ce budget ouvre davantage de choix en matière d’ANC, d’autonomie et de résistance, mais les performances réelles varient selon les modèles. Vérifiez les spécifications avant l’achat.' : 'This budget opens up more choices for ANC, battery life and resistance, but real-world performance varies by model. Check the specifications before buying.'}</p></section><section className="mt-12"><h2 className="font-display font-semibold text-[25px]">{fr ? 'Méthodologie' : 'Methodology'}</h2><p className="text-dim text-sm leading-7 max-w-3xl mt-3">{fr ? 'Le score utilise uniquement les données disponibles dans le catalogue et privilégie les fonctionnalités utiles, l’autonomie, le poids et la résistance. Il ne remplace pas un test indépendant.' : 'The score uses only catalog data and prioritizes useful features, battery life, weight and resistance. It does not replace independent testing.'}</p></section><section className="mt-12 border border-line rounded-2xl p-6 bg-panel"><h2 className="font-display font-semibold text-xl">{fr ? 'Guide associé' : 'Related guide'}</h2><Link className="inline-block mt-4 text-accent font-mono text-xs uppercase" href={`/${locale}/guides/best-earbuds-under-100`}>{fr ? 'Voir les écouteurs sous 100 $ →' : 'See earbuds under $100 →'}</Link></section></article><AdSlot variant="native" zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY} invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN} label={locale === 'en' ? 'Advertisement' : 'Publicité'} /><Footer/></>;
}
