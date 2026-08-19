import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getAllEarbuds, getBrands, getAncIntelligence } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { getGuide } from '@/lib/guidePages';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { GUIDE_PAGES } = await import('@/lib/guidePages');
  return GUIDE_PAGES.flatMap((guide) => ['en', 'fr'].map((locale) => ({ locale, slug: guide.slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const copy = guide[locale] || guide.en;
  return { title: `${copy.title} | EarbudsTimeline`, description: copy.description, ...canonicalFor(`/${locale}/guides/${slug}`) };
}

const ANC_CONTENT = {
  en: {
    kicker: 'ANC Intelligence',
    quickTitle: 'Best noise cancelling earbuds',
    methodology: 'Our ANC ranking is built from environment-specific evidence rather than an ANC checkbox. We combine the overall ANC score with Travel, Office, Traffic and Voices performance, then use evidence coverage and source count as confidence signals. Models without enough evidence are kept visible but are not presented as verified winners.',
    verified: 'Evidence-backed ANC ranking',
    verifiedNote: 'Only models with a computed ANC score are ranked here. This prevents a specification-only claim from outranking independently documented performance.',
    incomplete: 'ANC models still awaiting verification',
    incompleteNote: 'These earbuds advertise or include ANC, but our environment-specific evidence is not yet sufficient to assign a defensible overall ANC score.',
    coverage: 'Coverage', evidence: 'evidence', sources: 'sources',
    environments: [['Travel', 'anc_travel_score'], ['Office', 'anc_office_score'], ['Traffic', 'anc_traffic_score'], ['Voices', 'anc_voices_score']],
    sections: [
      ['How we rank ANC', 'ANC is evaluated by environment because excellent airplane performance does not automatically mean excellent voice isolation in an office. We therefore keep separate scores for Travel, Office, Traffic and Voices before calculating the overall ANC result.'],
      ['Why evidence quality matters', 'A high score supported by several independent sources is more useful than a marketing claim with no environment-specific testing. Coverage shows how many of the four environments have evidence, while source count shows how broadly the result is documented.'],
      ['Best ANC for travel', 'Travel favors models that can suppress low-frequency engine rumble and the broad background noise of planes, trains and buses. Look at the Travel score first, then check battery life and fit for long sessions.'],
      ['Best ANC for office', 'Office use has a different noise profile: voices, HVAC systems, keyboards and intermittent background sounds. The Office score is therefore more useful than a generic ANC label when your main goal is focus.'],
      ['Best ANC for traffic', 'Traffic emphasizes low-frequency engines and road noise. A strong Traffic score is particularly relevant to commuting, buses and urban environments.'],
      ['Best ANC for voices', 'Human voices are harder to suppress than steady low-frequency noise. The Voices score isolates this use case so you can choose a model for coworkers, passengers and general conversation.'],
    ],
    faqTitle: 'Noise cancelling earbuds FAQ',
    faq: [
      ['What are the best noise cancelling earbuds?', 'The best verified model is the one with the strongest documented ANC performance across the environments that matter to you, not simply the model with an ANC specification.'],
      ['Why are some ANC earbuds not ranked?', 'We deliberately avoid assigning an overall score when the environment-specific evidence is insufficient. Those models remain visible while their data is being completed.'],
      ['Is the ANC score a laboratory measurement?', 'No. It is an evidence-derived intelligence score. Laboratory and editorial measurements can contribute to it, but the score is not itself a single laboratory dB measurement.'],
      ['Which ANC score should I use?', 'Use Travel for flights and public transport, Office for work and background chatter, Traffic for commuting and engines, and Voices when human conversation is your main problem.'],
    ],
  },
  fr: {
    kicker: 'ANC Intelligence',
    quickTitle: 'Les meilleurs écouteurs avec réduction de bruit',
    methodology: 'Notre classement ANC repose sur des preuves par environnement, pas sur une simple case ANC. Nous combinons le score ANC global avec les performances Travel, Office, Traffic et Voices, puis utilisons la couverture des preuves et le nombre de sources comme indicateurs de confiance. Les modèles insuffisamment documentés restent visibles mais ne sont pas présentés comme des gagnants vérifiés.',
    verified: 'Classement ANC basé sur des preuves',
    verifiedNote: 'Seuls les modèles disposant d’un score ANC calculé sont classés ici. Cela évite qu’une simple promesse marketing puisse devancer une performance réellement documentée.',
    incomplete: 'Modèles ANC encore en cours de vérification',
    incompleteNote: 'Ces écouteurs disposent ou annoncent l’ANC, mais nos preuves par environnement ne sont pas encore suffisantes pour leur attribuer un score ANC global défendable.',
    coverage: 'Couverture', evidence: 'preuves', sources: 'sources',
    environments: [['Travel', 'anc_travel_score'], ['Office', 'anc_office_score'], ['Traffic', 'anc_traffic_score'], ['Voices', 'anc_voices_score']],
    sections: [
      ['Comment nous classons l’ANC', 'Nous évaluons l’ANC par environnement car une excellente réduction dans un avion ne signifie pas automatiquement une excellente isolation des voix au bureau. Nous conservons donc quatre sous-scores : Travel, Office, Traffic et Voices, avant de calculer le résultat ANC global.'],
      ['Pourquoi la qualité des preuves compte', 'Un score élevé soutenu par plusieurs sources indépendantes est plus utile qu’une promesse marketing sans test précis. La couverture indique combien des quatre environnements sont documentés et le nombre de sources indique à quel point le résultat est corroboré.'],
      ['Meilleur ANC pour voyager', 'Le voyage favorise les modèles capables de réduire les grondements des moteurs et le bruit ambiant des avions, trains et bus. Regardez d’abord Travel, puis l’autonomie et le maintien pour les longues sessions.'],
      ['Meilleur ANC au bureau', 'Le bureau présente un profil différent : voix, ventilation, claviers et bruits intermittents. Le score Office est donc plus pertinent qu’une simple mention ANC lorsque votre objectif est la concentration.'],
      ['Meilleur ANC dans le trafic', 'Le trafic met l’accent sur les moteurs et les bruits routiers. Un bon score Traffic est particulièrement pertinent pour les trajets quotidiens, les bus et les environnements urbains.'],
      ['Meilleur ANC contre les voix', 'Les voix humaines sont plus difficiles à supprimer qu’un bruit grave et continu. Le score Voices isole ce cas d’usage pour choisir un modèle adapté aux collègues, passagers et conversations.'],
    ],
    faqTitle: 'FAQ sur les écouteurs avec réduction de bruit',
    faq: [
      ['Quels sont les meilleurs écouteurs ANC ?', 'Le meilleur modèle vérifié est celui dont les performances ANC sont les mieux documentées dans les environnements qui vous concernent, pas simplement celui qui possède une fiche ANC.'],
      ['Pourquoi certains écouteurs ANC ne sont-ils pas classés ?', 'Nous évitons volontairement de calculer un score global lorsque les preuves par environnement sont insuffisantes. Ils restent visibles pendant que leurs données sont complétées.'],
      ['Le score ANC est-il une mesure de laboratoire ?', 'Non. Il s’agit d’un score d’intelligence dérivé des preuves. Des mesures de laboratoire et des tests éditoriaux peuvent l’alimenter, mais le score n’est pas lui-même une unique mesure en dB.'],
      ['Quel sous-score ANC dois-je regarder ?', 'Travel pour les avions et transports, Office pour le travail, Traffic pour les moteurs et trajets urbains, et Voices lorsque les conversations sont votre principal problème.'],
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
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-dim">{label}</span><span>{score ?? '—'}</span></div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${score ?? 0}%` }} /></div>
    </div>
  );
}

function ProductCard({ model, brand, intelligence, rank, copy, locale }) {
  const anc = scoreValue(intelligence?.anc_score);
  return (
    <Link href={`/ecouteurs/${model.id}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors block">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <span className="font-mono text-accent text-sm shrink-0">#{rank}</span>
          <div className="min-w-0">
            <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">{brand?.name || model.brand_id}</div>
            <h3 className="font-display font-semibold text-[16px] leading-tight">{model.name}</h3>
          </div>
        </div>
        {anc !== null && <div className="text-right shrink-0"><div className="font-display font-bold text-2xl">{anc}</div><div className="font-mono text-[9px] text-dim">ANC /100</div></div>}
      </div>
      {intelligence ? <div className="mt-5 space-y-2.5">{copy.environments.map(([label, key]) => <ScoreBar key={key} label={label} value={intelligence[key]} />)}</div> : <p className="mt-5 text-xs text-dim">{copy.incompleteNote}</p>}
      <div className="mt-5 pt-3 border-t border-line"><Coverage item={intelligence || {}} copy={copy} /></div>
    </Link>
  );
}

function CompareTable({ rows, copy, locale }) {
  return <div className="overflow-x-auto border border-line rounded-2xl"><table className="w-full text-sm min-w-[760px]"><thead><tr className="border-b border-line text-left"><th className="p-3 font-mono text-[10px] text-dim uppercase">#</th><th className="p-3">{locale === 'fr' ? 'Modèle' : 'Model'}</th><th className="p-3">ANC</th><th className="p-3">Travel</th><th className="p-3">Office</th><th className="p-3">Traffic</th><th className="p-3">Voices</th><th className="p-3">{copy.coverage}</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.model.id} className="border-b border-line last:border-0"><td className="p-3 font-mono text-accent">{i + 1}</td><td className="p-3"><Link href={`/ecouteurs/${row.model.id}`} className="hover:text-accent">{row.model.name}</Link></td><td className="p-3 font-mono font-semibold">{scoreValue(row.intelligence.anc_score) ?? '—'}</td>{copy.environments.map(([_, key]) => <td key={key} className="p-3 font-mono">{scoreValue(row.intelligence[key]) ?? '—'}</td>)}<td className="p-3"><Coverage item={row.intelligence} copy={copy} /></td></tr>)}</tbody></table></div>;
}

function FAQ({ items, title }) {
  return <section className="mt-14"><h2 className="font-display font-semibold text-[24px] mb-5">{title}</h2><div className="divide-y divide-line border-y border-line">{items.map(([question, answer]) => <details key={question} className="py-4 group"><summary className="cursor-pointer list-none font-display font-medium flex justify-between gap-4">{question}<span className="text-accent group-open:rotate-45 transition-transform">+</span></summary><p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{answer}</p></details>)}</div></section>;
}

export default async function GuidePage({ params }) {
  const { locale, slug } = params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const copy = guide[locale] || guide.en;
  const isANC = slug === 'best-noise-cancelling-earbuds';
  const [models, brands, ancScores] = await Promise.all([getAllEarbuds(), getBrands(), isANC ? getAncIntelligence() : Promise.resolve([])]);
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));
  const enhanced = isANC ? ANC_CONTENT[locale] || ANC_CONTENT.en : null;
  const scoreMap = new Map(ancScores.map((item) => [item.earbud_id, item]));

  let candidates = models.filter((model) => !guide.filter || guide.filter(model));
  if (guide.brand) candidates = candidates.filter((model) => model.brand_id === guide.brand);

  if (isANC) {
    const rows = candidates.map((model) => ({ model, intelligence: scoreMap.get(model.id) || null }));
    rows.sort((a, b) => {
      const as = scoreValue(a.intelligence?.anc_score);
      const bs = scoreValue(b.intelligence?.anc_score);
      if (as !== null || bs !== null) return (bs ?? -1) - (as ?? -1);
      return (Number(b.intelligence?.source_count || 0) - Number(a.intelligence?.source_count || 0)) || (Number(b.intelligence?.evidence_count || 0) - Number(a.intelligence?.evidence_count || 0));
    });
    candidates = rows;
  } else {
    if (guide.sort) candidates = [...candidates].sort(guide.sort);
    candidates = candidates.slice(0, 12).map((model) => ({ model, intelligence: null }));
  }

  const verified = isANC ? candidates.filter((row) => scoreValue(row.intelligence?.anc_score) !== null) : candidates;
  const incomplete = isANC ? candidates.filter((row) => scoreValue(row.intelligence?.anc_score) === null) : [];
  const top = verified.slice(0, 12);
  const title = copy.title;
  const description = copy.description;
  const sections = enhanced?.sections || copy.sections;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, url: `https://earbudstimeline.com/${locale}/guides/${slug}` };
  if (enhanced?.faq) jsonLd.mainEntity = enhanced.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }));

  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto">
    <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">{enhanced?.kicker || 'Earbuds Guide'}</div>
    <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{title}</h1>
    <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{copy.intro}</p>

    {enhanced && <div className="mt-8 rounded-2xl border border-accent/30 bg-panel p-5 sm:p-6"><div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-2">{enhanced.quickTitle}</div><p className="text-dim text-sm leading-7">{enhanced.methodology}</p></div>}

    {isANC ? <>
      <section className="mt-10"><div className="flex items-end justify-between gap-4 mb-5"><div><div className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-1">{enhanced.verified}</div><h2 className="font-display font-semibold text-[26px]">{locale === 'fr' ? 'Les modèles les mieux documentés' : 'The best documented models'}</h2><p className="text-dim text-sm mt-2 max-w-2xl">{enhanced.verifiedNote}</p></div><span className="font-mono text-xs text-dim">{verified.length} verified</span></div>{top.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{top.map((row, i) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} rank={i + 1} copy={enhanced} locale={locale} />)}</div> : <div className="border border-line rounded-2xl p-6 text-dim text-sm">{enhanced.incompleteNote}</div>}</section>
      {top.length > 0 && <section className="mt-10"><h2 className="font-display font-semibold text-[23px] mb-4">{locale === 'fr' ? 'Comparatif ANC détaillé' : 'Detailed ANC comparison'}</h2><CompareTable rows={top} copy={enhanced} locale={locale} /></section>}
      {incomplete.length > 0 && <section className="mt-12"><div className="mb-5"><div className="font-mono text-xs text-dim uppercase tracking-[0.12em] mb-1">{enhanced.incomplete}</div><h2 className="font-display font-semibold text-[23px]">{locale === 'fr' ? 'À surveiller, mais pas encore classés' : 'Worth watching, not ranked yet'}</h2><p className="text-dim text-sm mt-2 max-w-2xl">{enhanced.incompleteNote}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{incomplete.slice(0, 12).map((row) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} copy={enhanced} locale={locale} />)}</div></section>}
    </> : <section className="mt-10"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">{candidates.map((row, index) => <ProductCard key={row.model.id} {...row} brand={brandMap.get(row.model.brand_id)} rank={index + 1} copy={{ environments: [], coverage: 'Coverage', evidence: 'evidence', sources: 'sources', incompleteNote: '' }} locale={locale} />)}</div></section>}

    <div className="grid gap-8 mt-12">{sections.map(([heading, body]) => <section key={heading}><h2 className="font-display font-semibold text-[21px] mb-2">{heading}</h2><p className="text-dim text-[14px] leading-7">{body}</p></section>)}</div>
    {enhanced?.faq && <FAQ items={enhanced.faq} title={enhanced.faqTitle} />}
    <div className="mt-10 flex flex-wrap gap-3 text-sm"><Link href="/trouver-mes-ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Trouver mes écouteurs' : 'Find my earbuds'}</Link><Link href="/ecouteurs" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">{locale === 'fr' ? 'Voir tous les modèles' : 'Browse all models'}</Link></div>
  </article><Footer locale={locale} /></>;
}
