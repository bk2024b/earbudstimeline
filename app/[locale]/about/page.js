import { Link } from '@/i18n/navigation';
import { canonicalFor, buildBreadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';
import {
  Compass,
  History,
  GitBranch,
  Layers,
  Sparkles,
  Search,
  Cpu,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const revalidate = 86400;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'About EarbudsTimeline | Explore the History and Evolution of Wireless Earbuds'
    : "À propos d'EarbudsTimeline | L'Histoire et l'Évolution des Écouteurs Sans Fil";

  const description = isEn
    ? 'Learn what EarbudsTimeline is and explore the history, evolution, products, brands and technologies behind wireless earbuds. Discover timelines, comparisons, Discovery Trails and more.'
    : "Découvrez ce qu'est EarbudsTimeline : l'histoire, l'évolution, les produits, marques et technologies des écouteurs sans fil. Timelines, comparaisons, Discovery Trails et plus.";

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/about`),
    openGraph: {
      title,
      description,
      url: `https://www.earbudstimeline.com/${locale}/about`,
      type: 'website',
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = params;
  const isEn = locale === 'en';

  const homeLabel = isEn ? 'Home' : 'Accueil';
  const aboutLabel = isEn ? 'About' : 'À propos';

  const faqItems = isEn
    ? [
        {
          q: 'What is EarbudsTimeline?',
          a: 'EarbudsTimeline is a dedicated knowledge platform and interactive database documenting the complete history, technical evolution, brands, and innovations of wireless earbuds since their inception.',
        },
        {
          q: 'What information can I find on EarbudsTimeline?',
          a: 'You can explore hundreds of earbuds with full verified technical specifications (battery life, weight, Bluetooth codecs, ANC, release dates, launch prices), generational lineage graphs, and historical market insights.',
        },
        {
          q: 'Can I compare wireless earbuds on EarbudsTimeline?',
          a: 'Yes. EarbudsTimeline provides side-by-side technical and generational comparisons, highlighting exact spec differences, historical improvements, and architectural evolutions.',
        },
        {
          q: 'Does EarbudsTimeline cover the history of wireless earbuds?',
          a: 'Yes. Every device is cataloged with its exact release year and placed within its product family lineage, giving full historical context to how features like Active Noise Cancellation, Bluetooth standards, and spatial audio emerged.',
        },
        {
          q: 'What is the Discovery Trail?',
          a: 'The Discovery Trail is a built-in exploration feature that remembers your journey through products, brands, comparisons, and articles, allowing you to follow curiosity-driven paths without getting lost.',
        },
        {
          q: 'Is EarbudsTimeline free and independent?',
          a: 'Yes. EarbudsTimeline is fully free and editorial independent, built for enthusiasts, audiophiles, researchers, students, and buyers.',
        },
      ]
    : [
        {
          q: "Qu'est-ce qu'EarbudsTimeline ?",
          a: "EarbudsTimeline est une plateforme de connaissances et une base de données interactive documentant l'histoire complète, l'évolution technique, les marques et les innovations des écouteurs sans fil depuis leurs débuts.",
        },
        {
          q: 'Quelles informations puis-je trouver sur EarbudsTimeline ?',
          a: "Vous pouvez explorer des centaines d'écouteurs avec fiches techniques vérifiées (autonomie, poids, codecs Bluetooth, ANC, dates de sortie, prix de lancement), graphes de lignées générationnelles et analyses historiques.",
        },
        {
          q: 'Puis-je comparer des écouteurs sans fil sur EarbudsTimeline ?',
          a: "Oui. EarbudsTimeline propose des comparateurs techniques et générationnels détaillés, mettant en évidence les écarts de specs, les gains d'autonomie et les évolutions de chaque génération.",
        },
        {
          q: "EarbudsTimeline couvre-t-il l'histoire des écouteurs sans fil ?",
          a: "Absolument. Chaque modèle est contextualisé dans sa lignée et son année de sortie, montrant l'émergence des technologies majeures comme la réduction active du bruit (ANC), les codecs HD et l'audio spatial.",
        },
        {
          q: "Qu'est-ce que le Discovery Trail (Fil de découverte) ?",
          a: 'Le Discovery Trail est un système de navigation exploratoire qui mémorise votre parcours à travers les fiches, marques et articles pour transformer la recherche en un voyage fluide et interconnecté.',
        },
        {
          q: 'EarbudsTimeline est-il gratuit et indépendant ?',
          a: 'Oui. EarbudsTimeline est 100% accessible gratuitement et rédigé de manière indépendante pour les passionnés de tech, audiophiles, étudiants et acheteurs.',
        },
      ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: isEn ? 'About EarbudsTimeline' : "À propos d'EarbudsTimeline",
    description: isEn
      ? 'The complete knowledge base documenting the history, evolution, and technologies of wireless earbuds.'
      : "La base de connaissances complète documentant l'histoire, l'évolution et les technologies des écouteurs sans fil.",
    url: `https://www.earbudstimeline.com/${locale}/about`,
  };

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: aboutLabel, url: '/about' },
        ], locale)}
      />
      <JsonLd data={aboutSchema} />
      <JsonLd data={faqSchema} />

      {/* Hero Header */}
      <section className="relative text-center max-w-3xl mx-auto pt-6 sm:pt-10 mb-16 sm:mb-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[250px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="path-indicator inline-flex items-center gap-2 text-accent border border-accent/30 bg-accent/10 rounded-base px-3.5 py-1 mb-5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>{isEn ? 'Manifesto & Knowledge Platform' : 'Manifeste & Plateforme de Connaissances'}</span>
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-fg mb-4 tracking-tight leading-[1.05]">
          <span className="text-brand-gradient">
            {isEn ? 'The Story Behind' : "L'Histoire Derrière"}
          </span>{' '}
          <span className="text-accent">{isEn ? 'Wireless Earbuds' : 'Les Écouteurs Sans Fil'}</span>
        </h1>

        <p className="text-dim text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          {isEn
            ? "From early experimental Bluetooth headsets to today's AI-assisted spatial audio powerhouses, wireless earbuds have revolutionized how the world listens. EarbudsTimeline was built to document that evolution."
            : "Des premiers casques Bluetooth expérimentaux aux écouteurs modernes à réduction de bruit et audio spatialisé, les écouteurs sans fil ont transformé notre quotidien sonore. EarbudsTimeline a été créé pour documenter cette aventure."}
        </p>

        <div className="flex gap-4 flex-wrap justify-center items-center">
          <Link href="/timeline" className="btn-primary">
            <span>{isEn ? 'Explore Interactive Timeline' : 'Explorer la Timeline Interactive'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/ecouteurs" className="btn-ghost">
            <span>{isEn ? 'Browse All Models' : 'Parcourir la Base de Données'}</span>
          </Link>
        </div>
      </section>

      {/* Section: Why EarbudsTimeline is Different */}
      <section className="mb-20">
        <div className="path-indicator text-accent text-center mb-2">
          {isEn ? 'Core Differentiation' : 'Notre Différence'}
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-fg mb-10">
          {isEn ? 'Why EarbudsTimeline is Different' : 'Pourquoi EarbudsTimeline est unique'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hardware-card bg-panel p-6">
            <div className="w-10 h-10 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mb-4">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-fg mb-2">
              {isEn ? '🗓️ History First' : '🗓️ L’Histoire d’abord'}
            </h3>
            <p className="text-dim text-xs leading-relaxed font-mono">
              {isEn
                ? 'Products placed within their exact historical context, not as isolated consumer devices.'
                : 'Chaque produit est replacé dans son contexte temporel exact, pas comme un objet isolé.'}
            </p>
          </div>

          <div className="hardware-card bg-panel p-6">
            <div className="w-10 h-10 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-fg mb-2">
              {isEn ? '🔗 Connected Knowledge' : '🔗 Connaissances Liées'}
            </h3>
            <p className="text-dim text-xs leading-relaxed font-mono">
              {isEn
                ? 'Brands, product lineups, generations, competitors, and innovations woven into an entity graph.'
                : 'Marques, lignées, générations et technologies interconnectées dans un réseau structuré.'}
            </p>
          </div>

          <div className="hardware-card bg-panel p-6">
            <div className="w-10 h-10 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-fg mb-2">
              {isEn ? '📊 Structured Data' : '📊 Données Structurées'}
            </h3>
            <p className="text-dim text-xs leading-relaxed font-mono">
              {isEn
                ? 'Verified battery life, ANC chips, weight, and Bluetooth versions across hundreds of models.'
                : 'Spécifications vérifiées d’autonomie, ANC, poids et codecs sur des centaines de modèles.'}
            </p>
          </div>

          <div className="hardware-card bg-panel p-6">
            <div className="w-10 h-10 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-fg mb-2">
              {isEn ? '🧭 Built for Discovery' : '🧭 Fait pour Découvrir'}
            </h3>
            <p className="text-dim text-xs leading-relaxed font-mono">
              {isEn
                ? 'Exploration hooks, generational comparisons, and Discovery Trails that guide your curiosity.'
                : 'Hooks d’exploration, comparaisons de lignées et fil de découverte pour apprendre en continu.'}
            </p>
          </div>
        </div>
      </section>

      {/* Section: More Than a Product Database */}
      <section className="mb-20">
        <div className="hardware-card bg-panel p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="path-indicator text-accent mb-2">
                {isEn ? 'A New Paradigm' : 'Un Nouveau Paradigme'}
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-fg mb-4 leading-tight">
                {isEn ? 'More Than a Product Database' : 'Bien plus qu’un catalogue de fiches techniques'}
              </h2>
              <p className="text-dim text-sm sm:text-base leading-relaxed mb-4">
                {isEn
                  ? 'A typical product page tells you what an earbud has today. EarbudsTimeline shows you how it got there and why it matters.'
                  : 'Une fiche produit classique décrit les specs actuelles d’un appareil. EarbudsTimeline montre comment la technologie est arrivée là et pourquoi cela compte.'}
              </p>
              <p className="text-dim text-sm leading-relaxed mb-6">
                {isEn
                  ? 'We connect products, brands, generations, and technologies to help you understand the bigger picture of audio engineering.'
                  : 'Nous relions appareils, constructeurs, générations et technologies pour offrir une vision panoramique de l’ingénierie audio sans fil.'}
              </p>

              <div className="space-y-2.5">
                {[
                  isEn ? 'Complete product lineups & family trees' : 'Lignées complètes et arbres généalogiques de produits',
                  isEn ? 'Generational diffs & spec evolutions' : 'Diffs générationnels et évolutions précises de specs',
                  isEn ? 'Historical context from 2016 to today' : 'Contexte historique documenté de 2016 à aujourd’hui',
                  isEn ? 'Interactive timeline & data insights' : 'Timeline interactive et graphiques d’analyses macro',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-fg">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel2/70 border border-line rounded-base p-5 sm:p-6 font-mono text-xs text-dim space-y-4">
              <div className="text-accent font-semibold uppercase tracking-wider text-[11px] pb-2 border-b border-line">
                {isEn ? 'Connected Entity Architecture' : 'Architecture d’Entités Connectées'}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-fg font-bold">1. Brands</span>
                <span className="text-dim">→ Apple, Sony, Samsung, Bose, Nothing...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-fg font-bold">2. Lineups</span>
                <span className="text-dim">→ AirPods Pro, Galaxy Buds Pro, WF-1000X...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-fg font-bold">3. Generations</span>
                <span className="text-dim">→ Gen 1 (2019) → Gen 2 (2022) → Next Gen</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-fg font-bold">4. Technologies</span>
                <span className="text-dim">→ ANC, Spatial Audio, LDAC, Multipoint, USB-C...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-fg font-bold">5. Timelines</span>
                <span className="text-dim">→ Market evolution and historical landmarks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Unique Features (Discovery Trail, Ctrl+K, Compare) */}
      <section className="mb-20">
        <div className="path-indicator text-accent text-center mb-2">
          {isEn ? 'Exploration Tools' : 'Outils d’Exploration'}
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-fg mb-10">
          {isEn ? 'Built for Frictionless Exploration' : 'Conçu pour une exploration sans friction'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hardware-card bg-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-accent" />
                <span className="path-indicator text-accent text-[11px]">Discovery Trail</span>
              </div>
              <h3 className="font-display font-bold text-lg text-fg mb-2">
                {isEn ? 'Follow Curiosity Paths' : 'Suivez votre fil de découverte'}
              </h3>
              <p className="text-dim text-xs leading-relaxed mb-4">
                {isEn
                  ? 'Your exploration history is persisted in a lightweight floating trail. Jump between generations, rivals, and guides without ever losing track.'
                  : 'Votre historique d’exploration est mémorisé dans un fil discret. Naviguez entre générations, rivaux et guides sans jamais vous perdre.'}
              </p>
            </div>
            <div className="pt-4 border-t border-line/60">
              <span className="text-[11px] font-mono text-accent">
                {isEn ? 'One model leads to an entire story.' : 'Un produit mène à une histoire complète.'}
              </span>
            </div>
          </div>

          <div className="hardware-card bg-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-accent" />
                <span className="path-indicator text-accent text-[11px]">Command Palette</span>
              </div>
              <h3 className="font-display font-bold text-lg text-fg mb-2">
                {isEn ? 'Search from Anywhere: Ctrl + K' : 'Recherche universelle : Ctrl + K'}
              </h3>
              <p className="text-dim text-xs leading-relaxed mb-4">
                {isEn
                  ? 'Instant keyboard-driven search palette. Find any model, brand, or technology without leaving your current page.'
                  : 'Palette de commande instantanée. Trouvez n’importe quel écouteur, marque ou techno au clavier sans quitter votre page.'}
              </p>
            </div>
            <div className="pt-4 border-t border-line/60">
              <span className="text-[11px] font-mono text-accent">
                {isEn ? 'Press Ctrl + K (or ⌘K) on any page.' : 'Pressez Ctrl + K (ou ⌘K) sur n’importe quelle page.'}
              </span>
            </div>
          </div>

          <div className="hardware-card bg-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="path-indicator text-accent text-[11px]">Generational Diffs</span>
              </div>
              <h3 className="font-display font-bold text-lg text-fg mb-2">
                {isEn ? 'Compare What Really Changed' : 'Comparez les vrais progrès'}
              </h3>
              <p className="text-dim text-xs leading-relaxed mb-4">
                {isEn
                  ? 'Generational comparisons highlight real technical progress: battery gains, weight drops, Bluetooth codec upgrades, and ANC improvements.'
                  : 'Nos comparateurs mettent en avant les vrais progrès : gains d’autonomie, réduction du poids, nouveaux codecs et améliorations ANC.'}
              </p>
            </div>
            <div className="pt-4 border-t border-line/60">
              <Link href="/comparaisons" className="entity-bridge">
                {isEn ? 'Explore comparisons →' : 'Voir les comparaisons →'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Featured Internal Links (SEO Power Grid) */}
      <section className="mb-20">
        <div className="path-indicator text-accent text-center mb-2">
          {isEn ? 'Navigation Index' : 'Index de Navigation'}
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-fg mb-8">
          {isEn ? 'Explore EarbudsTimeline Hubs' : 'Explorez les grands pôles du site'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/ecouteurs" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Database' : 'Base de données'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'All Wireless Earbuds' : 'Tous les Écouteurs'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Complete searchable catalog of hundreds of models.' : 'Catalogue complet et filtrable de tous les modèles.'}
            </p>
          </Link>

          <Link href="/marques" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Brands' : 'Marques'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'All Audio Brands' : 'Toutes les Marques'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Apple, Sony, Bose, Samsung, JBL, Nothing, and more.' : 'Apple, Sony, Bose, Samsung, JBL, Nothing et plus.'}
            </p>
          </Link>

          <Link href="/timeline" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Chronology' : 'Chronologie'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Interactive Timeline' : 'Timeline Interactive'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Year-by-year history filterable by ANC and Bluetooth.' : 'Historique année par année filtrable par ANC et Bluetooth.'}
            </p>
          </Link>

          <Link href="/insights" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Data Trends' : 'Analyses'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Earbuds Insights' : 'Tendances & Données'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Macro analysis on battery, ANC adoption, and pricing.' : 'Analyses macro sur l’autonomie, l’ANC et les prix.'}
            </p>
          </Link>

          <Link href="/comparaisons" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Versus' : 'Comparaisons'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Head-to-Head Comparisons' : 'Duels & Comparateurs'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Generational diffs and rival earbuds comparisons.' : 'Comparaisons générationnelles et duels rivaux.'}
            </p>
          </Link>

          <Link href="/technologies" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Innovation' : 'Technologies'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Technology Evolution' : 'Histoire des Technologies'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'ANC, Codecs, Bluetooth, Multipoint, and USB-C.' : 'ANC, Codecs, Bluetooth, Multipoint et USB-C.'}
            </p>
          </Link>

          <Link href="/guides" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Buying Advice' : 'Conseils'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Buyers Guides' : 'Guides d’Achat'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Curated selections by budget, use-case, and comfort.' : 'Sélections par budget, sport, télétravail et confort.'}
            </p>
          </Link>

          <Link href="/trouver-mes-ecouteurs" className="hardware-card group bg-panel p-5">
            <div className="path-indicator text-accent text-[11px] mb-1">
              {isEn ? 'Finder' : 'Moteur d’Aide'}
            </div>
            <h3 className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors mb-1">
              {isEn ? 'Timeline Intelligence' : 'Trouver Mes Écouteurs'}
            </h3>
            <p className="text-dim text-xs font-mono">
              {isEn ? 'Recommend the exact #1 model for your price range.' : 'Recommandation intelligente du meilleur modèle à votre budget.'}
            </p>
          </Link>
        </div>
      </section>

      {/* Section: FAQ */}
      <section className="mb-20">
        <div className="path-indicator text-accent text-center mb-2">
          {isEn ? 'Frequently Asked Questions' : 'Foire Aux Questions'}
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-fg mb-8">
          {isEn ? 'Everything You Need to Know' : 'Tout ce que vous devez savoir'}
        </h2>

        <div className="hardware-card bg-panel p-6 sm:p-8 divide-y divide-line/60">
          {faqItems.map((item, idx) => (
            <div key={idx} className={idx === 0 ? 'pb-5' : 'py-5'}>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-1" />
                <h3 className="font-display font-bold text-base sm:text-lg text-fg m-0">
                  {item.q}
                </h3>
              </div>
              <p className="text-dim text-xs sm:text-sm leading-relaxed pl-7 m-0">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hardware-card relative overflow-hidden bg-gradient-to-br from-panel2 via-panel to-page border border-accent/40 p-8 sm:p-12 text-center mb-16 shadow-xl">
        <div className="max-w-xl mx-auto">
          <div className="path-indicator text-accent text-xs mb-3">
            {isEn ? 'Start Your Journey' : 'Commencez l’Aventure'}
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-fg mb-4">
            {isEn ? 'The story of wireless earbuds is still being written.' : 'L’histoire des écouteurs sans fil continue de s’écrire.'}
          </h2>
          <p className="text-dim text-sm leading-relaxed mb-8">
            {isEn
              ? 'EarbudsTimeline is here to document every breakthrough, every generation, and every leap forward.'
              : 'EarbudsTimeline est là pour documenter chaque innovation, chaque génération et chaque avancée.'}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/timeline" className="btn-primary px-7 py-3.5">
              <span>{isEn ? 'Explore the Timeline →' : 'Explorer la Timeline →'}</span>
            </Link>
            <Link href="/trouver-mes-ecouteurs" className="btn-ghost px-7 py-3.5">
              <span>{isEn ? 'Find My Earbuds' : 'Trouver Mes Écouteurs'}</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </>
  );
}
