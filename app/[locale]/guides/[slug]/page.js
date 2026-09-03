import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getAllEarbuds, getBrands, getAncIntelligence, getGuideBySlug, getPublishedGuideSlugs } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { applyFilter, applySort } from '@/lib/guideFilters';
import { rankByValuePerDollar } from '@/lib/budgetValue';
import EarbudsIcon from '@/components/EarbudsIcon';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedGuideSlugs();
  return slugs.flatMap((slug) => ['en', 'fr'].map((locale) => ({ locale, slug })));
}

// Normalizes a `guides` table row into the { en: {...}, fr: {...} } shape the
// rest of this page expects, so the JSX below did not need to change when
// guides moved from lib/guidePages.js into Supabase.
function guideCopy(row) {
  const build = (lang) => ({
    title: row[`title_${lang}`],
    description: row[`description_${lang}`],
    intro: row[`intro_${lang}`],
    sections: row[`sections_${lang}`] || [],
    faq: row[`faq_${lang}`] || null,
  });
  return { en: build('en'), fr: build('fr') };
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const row = await getGuideBySlug(slug);
  if (!row) return {};
  const guide = guideCopy(row);
  const copy = guide[locale] || guide.en;
  return { title: `${copy.title} | EarbudsTimeline`, description: copy.description, ...canonicalFor(`/${locale}/guides/${slug}`) };
}

const ANC_CONTENT = {
  en: {
    kicker: 'ANC Intelligence', quickTitle: 'Best noise cancelling earbuds',
    methodology: 'Our ANC ranking is built from environment-specific evidence rather than an ANC checkbox. We combine Travel, Office, Traffic and Voices performance, then use evidence coverage and source count as confidence signals.',
    verified: 'Evidence-backed ANC ranking', verifiedNote: 'Only models with a computed ANC score are ranked here.', incomplete: 'ANC models still awaiting verification',
    incompleteNote: 'These earbuds advertise or include ANC, but environment-specific evidence is not yet sufficient to assign a defensible overall ANC score.',
    coverage: 'Coverage', evidence: 'evidence', sources: 'sources',
    environments: [['Travel', 'anc_travel_score'], ['Office', 'anc_office_score'], ['Traffic', 'anc_traffic_score'], ['Voices', 'anc_voices_score']],
    sections: [
      ['How we rank ANC', 'ANC is evaluated by environment because excellent airplane performance does not automatically mean excellent voice isolation in an office.'],
      ['Why evidence quality matters', 'A high score supported by several independent sources is more useful than a marketing claim with no environment-specific testing.'],
      ['Best ANC for travel', 'Travel favors suppression of low-frequency engine rumble and broad background noise from planes, trains and buses.'],
      ['Best ANC for office', 'Office use has a different noise profile: voices, HVAC systems, keyboards and intermittent background sounds.'],
      ['Best ANC for traffic', 'Traffic emphasizes low-frequency engines and road noise, making this score useful for commuting and urban environments.'],
      ['Best ANC for voices', 'Human voices are harder to suppress than steady low-frequency noise, so Voices isolates this use case.'],
    ],
    faqTitle: 'Noise cancelling earbuds FAQ',
    faq: [
      ['What are the best noise cancelling earbuds?', 'The best verified model is the one with the strongest documented ANC performance across the environments that matter to you.'],
      ['Are noise cancelling earbuds and ANC earbuds the same thing?', 'Yes — "noise cancelling earbuds" and "ANC earbuds" refer to the same active noise cancelling technology; this page ranks them the same way regardless of which phrase a product listing uses.'],
      ['Why are some ANC earbuds not ranked?', 'We avoid assigning an overall score when environment-specific evidence is insufficient.'],
      ['Is the ANC score a laboratory measurement?', 'No. It is an evidence-derived intelligence score, not a single laboratory dB measurement.'],
      ['Which ANC score should I use?', 'Use Travel for transport, Office for work, Traffic for engines and commuting, and Voices when conversations are the main problem.'],
    ],
  },
  fr: {
    kicker: 'ANC Intelligence', quickTitle: 'Les meilleurs écouteurs avec réduction de bruit',
    methodology: 'Notre classement ANC repose sur des preuves par environnement. Nous combinons Travel, Office, Traffic et Voices, puis utilisons la couverture des preuves et le nombre de sources comme indicateurs de confiance.',
    verified: 'Classement ANC basé sur des preuves', verifiedNote: 'Seuls les modèles disposant d’un score ANC calculé sont classés ici.', incomplete: 'Modèles ANC encore en cours de vérification',
    incompleteNote: 'Ces écouteurs disposent ou annoncent l’ANC, mais les preuves par environnement ne sont pas encore suffisantes pour calculer un score global défendable.',
    coverage: 'Couverture', evidence: 'preuves', sources: 'sources',
    environments: [['Travel', 'anc_travel_score'], ['Office', 'anc_office_score'], ['Traffic', 'anc_traffic_score'], ['Voices', 'anc_voices_score']],
    sections: [
      ['Comment nous classons l’ANC', 'Nous évaluons l’ANC par environnement car une excellente réduction dans un avion ne signifie pas automatiquement une excellente isolation des voix au bureau.'],
      ['Pourquoi la qualité des preuves compte', 'Un score élevé soutenu par plusieurs sources indépendantes est plus utile qu’une promesse marketing sans test précis.'],
      ['Meilleur ANC pour voyager', 'Travel favorise les modèles capables de réduire les grondements des moteurs et le bruit ambiant des transports.'],
      ['Meilleur ANC au bureau', 'Office est plus pertinent lorsque votre objectif est la concentration face aux voix, à la ventilation et aux bruits intermittents.'],
      ['Meilleur ANC dans le trafic', 'Traffic met l’accent sur les moteurs et les bruits routiers, notamment pour les trajets urbains.'],
      ['Meilleur ANC contre les voix', 'Voices isole les performances face aux conversations, qui sont plus difficiles à supprimer qu’un bruit grave continu.'],
    ],
    faqTitle: 'FAQ sur les écouteurs avec réduction de bruit',
    faq: [
      ['Quels sont les meilleurs écouteurs ANC ?', 'Le meilleur modèle vérifié est celui dont les performances ANC sont les mieux documentées dans les environnements qui vous concernent.'],
      ['Écouteurs à réduction de bruit et écouteurs ANC, est-ce la même chose ?', 'Oui — "écouteurs à réduction de bruit" et "écouteurs ANC" désignent la même technologie de réduction de bruit active ; cette page les classe de la même façon quelle que soit l’expression utilisée sur la fiche produit.'],
      ['Pourquoi certains écouteurs ANC ne sont-ils pas classés ?', 'Nous évitons de calculer un score global lorsque les preuves par environnement sont insuffisantes.'],
      ['Le score ANC est-il une mesure de laboratoire ?', 'Non. Il s’agit d’un score d’intelligence dérivé des preuves, pas d’une unique mesure en dB.'],
      ['Quel sous-score ANC dois-je regarder ?', 'Travel pour les transports, Office pour le travail, Traffic pour les moteurs et Voices lorsque les conversations sont le principal problème.'],
    ],
  },
};

const BUDGET_CONTENT = {
  en: {
    kicker: 'Value Intelligence', quickTitle: 'Best budget earbuds',
    methodology: 'Budget ranking is not a cheapest-price list. We first calculate a product utility score from measurable catalogue attributes, then normalize Utility ÷ Price into a Value per Dollar score. This lets a $49 earbud beat a $29 model when the additional utility justifies the price.',
    valueLabel: 'Value / $', utilityLabel: 'Utility', priceLabel: 'Price',
    sections: [
      ['Why the cheapest earbud is not always the best budget pick', 'A low price is only one part of the decision. A slightly more expensive model can deliver materially more battery life, ANC, durability or connectivity.'],
      ['How Value per Dollar works', 'We calculate a price-independent Utility score from measurable catalogue attributes, then divide utility by price. The strongest utility-to-price ratio in this candidate set is normalized to 100.'],
      ['Overall quality vs budget value', 'A premium earbud can be the best product overall while a cheaper model is the better budget purchase. Value per Dollar is designed to make that distinction explicit.'],
    ],
  },
  fr: {
    kicker: 'Value Intelligence', quickTitle: 'Les meilleurs écouteurs sans fil pas chers',
    methodology: 'Le classement budget n’est pas une simple liste des prix les plus bas. Nous calculons d’abord un score d’utilité à partir de caractéristiques mesurables, puis un score Value per Dollar basé sur Utilité ÷ Prix. Un modèle à 49 $ peut donc dépasser un modèle à 29 $ si son utilité supplémentaire justifie le prix.',
    valueLabel: 'Value / $', utilityLabel: 'Utilité', priceLabel: 'Prix',
    sections: [
      ['Pourquoi le moins cher n’est pas toujours le meilleur choix budget', 'Le prix n’est qu’un élément. Un modèle légèrement plus cher peut offrir beaucoup plus d’autonomie, d’ANC, de robustesse ou de connectivité.'],
      ['Comment fonctionne Value per Dollar', 'Nous calculons un score d’utilité indépendant du prix à partir des caractéristiques mesurables, puis divisons cette utilité par le prix. Le meilleur ratio est normalisé à 100.'],
      ['Qualité globale vs valeur budget', 'Un écouteur premium peut être le meilleur produit global alors qu’un modèle moins cher est le meilleur achat budget. Value per Dollar rend cette distinction explicite.'],
    ],
  },
};

function scoreValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function Coverage({ item, copy }) {
  const coverage = Math.round((Number(item.environment_count || 0) / 4) * 100);
  return <span className="font-mono text-[10px] text-dim">{copy.coverage} {coverage}% · {item.evidence_count || 0} {copy.evidence} · {item.source_count || 0} {copy.sources}</span>;
}

function ScoreBar({ label, value }) {
  const score = scoreValue(value);
  return <div><div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-dim">{label}</span><span>{score ?? '—'}</span></div><div className="h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${score ?? 0}%` }} /></div></div>;
}

function ProductCard({ model, brand, intelligence, rank, copy, budget }) {
  const anc = scoreValue(intelligence?.anc_score);
  const value = scoreValue(model.value_per_dollar);
  const utility = scoreValue(model.utility_score);
  const badgeValue = budget ? value : anc;
  return <Link href={`/ecouteurs/${model.id}`} className="group bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent transition-colors block">
    <div className="relative w-full aspect-[4/3] bg-panel2 flex items-center justify-center overflow-hidden">
      {model.image_url ? (
        <Image
          src={model.image_url}
          alt={model.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 360px"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-16 h-16" />
      )}
      <span className="absolute top-2.5 left-2.5 font-mono text-[11px] bg-ink/85 backdrop-blur text-accent rounded-full w-6 h-6 flex items-center justify-center border border-accent/30">#{rank}</span>
      {badgeValue !== null && (
        <span className="absolute top-2.5 right-2.5 font-display font-bold text-base leading-none bg-ink/85 backdrop-blur rounded-lg px-2.5 py-1.5 border border-line">
          {badgeValue}
          <span className="block font-mono text-[8px] font-normal text-dim mt-0.5 text-center">{budget ? copy.valueLabel : 'ANC'}</span>
        </span>
      )}
    </div>
    <div className="p-4">
      <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">{brand?.name || model.brand_id}</div>
      <h3 className="font-display font-semibold text-[15px] leading-tight">{model.name}</h3>
      {budget ? <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg border border-line p-2"><div className="font-mono text-[9px] text-dim">{copy.priceLabel}</div><div className="font-mono text-sm mt-1">${Number(model.price).toFixed(0)}</div></div><div className="rounded-lg border border-line p-2"><div className="font-mono text-[9px] text-dim">{copy.utilityLabel}</div><div className="font-mono text-sm mt-1">{utility ?? '—'}</div></div><div className="rounded-lg border border-line p-2"><div className="font-mono text-[9px] text-dim">{copy.valueLabel}</div><div className="font-mono text-sm mt-1">{value ?? '—'}</div></div></div> : intelligence ? <div className="mt-4 space-y-2.5">{copy.environments.map(([label, key]) => <ScoreBar key={key} label={label} value={intelligence[key]} />)}</div> : null}
      {!budget && <div className="mt-4 pt-3 border-t border-line"><Coverage item={intelligence || {}} copy={copy} /></div>}
    </div>
  </Link>;
}

function CompareTable({ rows, copy, locale }) {
  return <div className="overflow-x-auto border border-line rounded-2xl"><table className="w-full text-sm min-w-[760px]"><thead><tr className="border-b border-line text-left"><th className="p-3">#</th><th className="p-3">{locale === 'fr' ? 'Modèle' : 'Model'}</th><th className="p-3">ANC</th>{copy.environments.map(([label]) => <th key={label} className="p-3">{label}</th>)}<th className="p-3">{copy.coverage}</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.model.id} className="border-b border-line last:border-0"><td className="p-3 font-mono text-accent">{i + 1}</td><td className="p-3"><Link href={`/ecouteurs/${row.model.id}`} className="hover:text-accent">{row.model.name}</Link></td><td className="p-3 font-mono">{scoreValue(row.intelligence.anc_score) ?? '—'}</td>{copy.environments.map(([_, key]) => <td key={key} className="p-3 font-mono">{scoreValue(row.intelligence[key]) ?? '—'}</td>)}<td className="p-3"><Coverage item={row.intelligence} copy={copy} /></td></tr>)}</tbody></table></div>;
}

function BudgetTable({ rows, copy, locale }) {
  return <div className="overflow-x-auto border border-line rounded-2xl"><table className="w-full text-sm min-w-[680px]"><thead><tr className="border-b border-line text-left"><th className="p-3">#</th><th className="p-3">{locale === 'fr' ? 'Modèle' : 'Model'}</th><th className="p-3">{copy.priceLabel}</th><th className="p-3">{copy.utilityLabel}</th><th className="p-3">{copy.valueLabel}</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.model.id} className="border-b border-line last:border-0"><td className="p-3 font-mono text-accent">{i + 1}</td><td className="p-3"><Link href={`/ecouteurs/${row.model.id}`} className="hover:text-accent">{row.model.name}</Link></td><td className="p-3 font-mono">${Number(row.model.price).toFixed(0)}</td><td className="p-3 font-mono">{row.model.utility_score ?? '—'}</td><td className="p-3 font-mono font-semibold">{row.model.value_per_dollar ?? '—'}</td></tr>)}</tbody></table></div>;
}

function FAQ({ items, title }) { return <section className="mt-14"><h2 className="font-display font-semibold text-[24px] mb-5">{title}</h2><div className="divide-y divide-line border-y border-line">{items.map(([q, a]) => <details key={q} className="py-4 group"><summary className="cursor-pointer list-none font-display font-medium flex justify-between gap-4">{q}<span className="text-accent group-open:rotate-45 transition-transform">+</span></summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p></details>)}</div></section>; }

export default async function GuidePage({ params }) {
  const { locale, slug } = params;
  const row = await getGuideBySlug(slug);
  if (!row) notFound();
  const guide = guideCopy(row);
  const copy = guide[locale] || guide.en;
  const isANC = row.render_variant === 'anc';
  const isBudget = row.render_variant === 'budget';
  const [models, brands, ancScores] = await Promise.all([getAllEarbuds(), getBrands(), isANC ? getAncIntelligence() : Promise.resolve([])]);
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));
  const enhanced = isANC ? ANC_CONTENT[locale] || ANC_CONTENT.en : isBudget ? BUDGET_CONTENT[locale] || BUDGET_CONTENT.en : null;
  const scoreMap = new Map(ancScores.map((item) => [item.earbud_id, item]));

  const baseCandidates = applyFilter(models, row.filter);

  let candidates;
  if (isANC) {
    candidates = baseCandidates.map((model) => ({ model, intelligence: scoreMap.get(model.id) || null }));
    candidates.sort((a, b) => (scoreValue(b.intelligence?.anc_score) ?? -1) - (scoreValue(a.intelligence?.anc_score) ?? -1) || Number(b.intelligence?.source_count || 0) - Number(a.intelligence?.source_count || 0));
  } else if (isBudget) {
    const ranked = rankByValuePerDollar(baseCandidates).filter((r) => r.value_per_dollar !== null);
    candidates = ranked.sort((a, b) => b.value_per_dollar - a.value_per_dollar || b.utility_score - a.utility_score).slice(0, 12).map((r) => ({ model: { ...r.model, value_per_dollar: r.value_per_dollar, utility_score: r.utility_score }, intelligence: null }));
  } else {
    candidates = applySort(baseCandidates, row.sort);
    candidates = candidates.slice(0, 12).map((model) => ({ model, intelligence: null }));
  }

  const verified = isANC ? candidates.filter((row) => scoreValue(row.intelligence?.anc_score) !== null) : candidates;
  const incomplete = isANC ? candidates.filter((row) => scoreValue(row.intelligence?.anc_score) === null) : [];
  const top = verified.slice(0, 12);
  const title = copy.title;
  const description = copy.description;
  const sections = enhanced?.sections || copy.sections;
  // Bespoke ANC/Budget pages carry their own hand-written FAQ (with a
  // matching title). Standard DB-driven guides can also have a FAQ
  // (guide.faq_en/faq_fr) — this used to only render for the two special
  // variants, silently dropping any FAQ set on a normal guide.
  const faqItems = enhanced?.faq || copy.faq;
  const faqTitle = enhanced?.faqTitle || (locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions');
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, url: `https://earbudstimeline.com/${locale}/guides/${slug}` };
  if (faqItems?.length) jsonLd.mainEntity = faqItems.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }));

  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto">
    <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">{enhanced?.kicker || 'Earbuds Guide'}</div>
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-6 items-start">
      <div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{copy.intro}</p>
      </div>
      {top[0] && (
        <Link href={`/ecouteurs/${top[0].model.id}`} className="hidden sm:block relative bg-panel border border-line rounded-2xl aspect-square overflow-hidden shrink-0 group">
          {top[0].model.image_url ? (
            <Image src={top[0].model.image_url} alt={top[0].model.name} fill sizes="180px" className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><EarbudsIcon color={brandMap.get(top[0].model.brand_id)?.color || '#9A9AA3'} className="w-16 h-16" /></div>
          )}
          <span className="absolute bottom-2 left-2 right-2 font-mono text-[9px] text-center bg-ink/85 backdrop-blur rounded px-1.5 py-1 truncate">{top[0].model.name}</span>
        </Link>
      )}
    </div>
    {enhanced && <div className="mt-8 rounded-2xl border border-accent/30 bg-panel p-5 sm:p-6"><div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-2">{enhanced.quickTitle}</div><p className="text-dim text-sm leading-7">{enhanced.methodology}</p></div>}

    {isANC ? <>
      <section className="mt-10"><div className="flex items-end justify-between gap-4 mb-5"><div><div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-1">{enhanced.verified}</div><h2 className="font-display font-semibold text-[26px]">{locale === 'fr' ? 'Les modèles les mieux documentés' : 'The best documented models'}</h2><p className="text-dim text-sm mt-2 max-w-2xl">{enhanced.verifiedNote}</p></div><span className="font-mono text-xs text-dim">{verified.length} verified</span></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{top.map((row, i) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} rank={i + 1} copy={enhanced} />)}</div></section>
      {top.length > 0 && <section className="mt-10"><h2 className="font-display font-semibold text-[23px] mb-4">{locale === 'fr' ? 'Comparatif ANC détaillé' : 'Detailed ANC comparison'}</h2><CompareTable rows={top} copy={enhanced} locale={locale} /></section>}
      {incomplete.length > 0 && <section className="mt-12"><div className="mb-5"><div className="font-mono text-xs text-dim uppercase tracking-[0.12em] mb-1">{enhanced.incomplete}</div><h2 className="font-display font-semibold text-[23px]">{locale === 'fr' ? 'À surveiller, mais pas encore classés' : 'Worth watching, not ranked yet'}</h2><p className="text-dim text-sm mt-2 max-w-2xl">{enhanced.incompleteNote}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{incomplete.slice(0, 12).map((row) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} copy={enhanced} />)}</div></section>}
    </> : isBudget ? <>
      <section className="mt-10"><div className="mb-5"><div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-1">{enhanced.quickTitle}</div><h2 className="font-display font-semibold text-[26px]">{locale === 'fr' ? 'Meilleure valeur pour le prix' : 'Best value for the money'}</h2><p className="text-dim text-sm mt-2 max-w-2xl">{enhanced.methodology}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{candidates.map((row, i) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} rank={i + 1} copy={enhanced} budget />)}</div></section>
      <section className="mt-10"><h2 className="font-display font-semibold text-[23px] mb-4">{locale === 'fr' ? 'Comparatif Value per Dollar' : 'Value per Dollar comparison'}</h2><BudgetTable rows={candidates} copy={enhanced} locale={locale} /></section>
    </> : <section className="mt-10"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">{candidates.map((row, i) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} rank={i + 1} copy={{ environments: [], coverage: 'Coverage', evidence: 'evidence', sources: 'sources', incompleteNote: '' }} />)}</div></section>}

    <AdSlot
      variant="native"
      zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_AFTER_INTRO_KEY}
      invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_AFTER_INTRO_DOMAIN}
      label={locale === 'en' ? 'Advertisement' : 'Publicité'}
    />

    <div className="grid gap-8 mt-12">{sections.map(([heading, body]) => <section key={heading}><h2 className="font-display font-semibold text-[21px] mb-2">{heading}</h2><p className="text-dim text-[14px] leading-7">{body}</p></section>)}</div>
    {faqItems?.length > 0 && <>
      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_MID_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_ARTICLE_MID_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />
      <FAQ items={faqItems} title={faqTitle} />
    </>}
    <div className="mt-10 flex flex-wrap gap-3 text-sm"><Link href="/trouver-mes-ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Trouver mes écouteurs' : 'Find my earbuds'}</Link><Link href="/ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Voir tous les modèles' : 'Browse all models'}</Link></div>
  </article><Footer locale={locale} /></>;
}
