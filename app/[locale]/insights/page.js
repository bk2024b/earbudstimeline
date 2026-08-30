import { getAllEarbuds, getBrands } from '@/lib/queries';
import { computeYearlySeries, computeYearlyAdoptionRate } from '@/lib/evolution';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import { Link } from '@/i18n/navigation';
import EvolutionExplorer from '@/components/EvolutionExplorer';
import BrandComparisonChart from '@/components/BrandComparisonChart';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    title: locale === 'en' ? 'Insights — EarbudsTimeline' : 'Insights — EarbudsTimeline',
    description:
      locale === 'en'
        ? 'What the history of wireless earbuds tells us: battery life, ANC adoption, price and weight trends across hundreds of models.'
        : "Ce que l'histoire des écouteurs sans fil nous apprend : autonomie, adoption de l'ANC, prix et poids, tendances sur des centaines de modèles.",
    ...canonicalFor(`/${locale}/insights`),
  };
}

// Première/dernière année avec au moins un point de donnée pour cette série —
// sert à afficher une évolution (ex. "+X% depuis {startYear}") sans supposer
// que chaque année du catalogue a des données pour chaque métrique.
function growth(series) {
  if (!series || series.length < 2) return null;
  const first = series[0];
  const last = series[series.length - 1];
  if (!first.value) return null;
  return {
    startYear: first.year,
    endYear: last.year,
    startValue: first.value,
    endValue: last.value,
    pct: Math.round(((last.value - first.value) / first.value) * 100),
  };
}

export default async function InsightsPage({ params }) {
  const { locale } = params;
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const en = locale === 'en';

  const years = models.map((m) => new Date(m.release_date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearsCovered = maxYear - minYear;

  const batterySeries = computeYearlySeries(models, 'battery_case_h');
  const batteryGrowth = growth(batterySeries);

  const ancSeries = computeYearlyAdoptionRate(models, 'anc');
  const ancLatest = ancSeries[ancSeries.length - 1];

  const priceSeries = computeYearlySeries(models, 'price', { onlyPresent: true });
  const priceGrowth = growth(priceSeries);

  const weightSeries = computeYearlySeries(models, 'weight_g');
  const weightGrowth = growth(weightSeries);

  const btSeries = computeYearlySeries(models, 'bluetooth', { parse: parseFloat });
  const btLatest = btSeries[btSeries.length - 1];
  const btFirst = btSeries[0];

  const brandShare = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((b) => ({ ...b, pct: Math.round((b.count / models.length) * 100) }));

  const title = 'Insights';
  const homeLabel = en ? 'Home' : 'Accueil';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: title, url: '/insights' },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: title,
          description: en
            ? 'Aggregate trends across the wireless earbuds catalog.'
            : "Tendances agrégées sur l'ensemble du catalogue d'écouteurs sans fil.",
          url: '/insights',
          locale,
          items: [],
        })}
      />

      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <span className="path-indicator inline-block text-accent border border-accent/30 bg-accent/10 rounded-full px-3 py-1 mb-4">
          {minYear} → {maxYear} · {en ? `${yearsCovered} years of evolution` : `${yearsCovered} ans d'évolution`}
        </span>
        <h1 className="font-display font-bold text-[32px] sm:text-[44px] leading-tight mb-3">
          {en ? 'Earbuds Insights' : 'Analyses & Tendances'}
        </h1>
        <p className="text-dim text-sm sm:text-base">
          {en
            ? `What does the history of wireless earbuds tell us? Explore trends across ${models.length} models.`
            : `Que nous apprend l'histoire des écouteurs sans fil ? Explorez les tendances sur ${models.length} modèles.`}
        </p>
      </div>

      {/* Tuiles de stats — toutes calculées depuis lib/evolution.js, aucune
          valeur codée en dur (les libellés changent selon les données réelles
          disponibles, contrairement à la maquette Stitch qui montrait des
          chiffres d'exemple). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {batteryGrowth && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 01 — Battery life' : 'Section 01 — Autonomie'}
            </div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h2 className="font-display font-semibold text-lg leading-snug">
                {en ? 'Wireless earbuds last longer.' : 'Les écouteurs tiennent plus longtemps.'}
              </h2>
              <span className="font-display font-bold text-3xl text-accent shrink-0">
                {batteryGrowth.pct > 0 ? '+' : ''}{batteryGrowth.pct}%
              </span>
            </div>
            <p className="text-dim text-xs">
              {en
                ? `Average case battery life went from ${batteryGrowth.startValue.toFixed(1)}h (${batteryGrowth.startYear}) to ${batteryGrowth.endValue.toFixed(1)}h (${batteryGrowth.endYear}).`
                : `L'autonomie moyenne avec boîtier est passée de ${batteryGrowth.startValue.toFixed(1)}h (${batteryGrowth.startYear}) à ${batteryGrowth.endValue.toFixed(1)}h (${batteryGrowth.endYear}).`}
            </p>
          </div>
        )}

        {ancLatest && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 02 — ANC' : 'Section 02 — ANC'}
            </div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h2 className="font-display font-semibold text-lg leading-snug">
                {en ? 'Noise cancellation became mainstream.' : "L'ANC s'est généralisé."}
              </h2>
              <span className="font-display font-bold text-3xl text-accent shrink-0">
                {Math.round(ancLatest.value)}%
              </span>
            </div>
            <p className="text-dim text-xs">
              {en
                ? `Of models released in ${ancLatest.year} feature Active Noise Cancellation.`
                : `Des modèles sortis en ${ancLatest.year} intègrent l'annulation active de bruit.`}
            </p>
          </div>
        )}

        {priceGrowth && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 03 — Price' : 'Section 03 — Prix'}
            </div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h2 className="font-display font-semibold text-lg leading-snug">
                {en ? 'Average price accessibility.' : 'Accessibilité des prix.'}
              </h2>
              <span className="font-display font-bold text-3xl text-fg shrink-0">
                ${Math.round(priceGrowth.endValue)}
              </span>
            </div>
            <p className="text-dim text-xs">
              {en
                ? `Average price went from $${Math.round(priceGrowth.startValue)} (${priceGrowth.startYear}) to $${Math.round(priceGrowth.endValue)} (${priceGrowth.endYear}).`
                : `Le prix moyen est passé de $${Math.round(priceGrowth.startValue)} (${priceGrowth.startYear}) à $${Math.round(priceGrowth.endValue)} (${priceGrowth.endYear}).`}
            </p>
          </div>
        )}

        {btLatest && btFirst && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 04 — Bluetooth' : 'Section 04 — Bluetooth'}
            </div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h2 className="font-display font-semibold text-lg leading-snug">
                {en ? 'Connectivity standards moved on.' : 'Les standards de connectivité ont évolué.'}
              </h2>
              <span className="font-display font-bold text-3xl text-fg shrink-0">
                BT {btLatest.value.toFixed(1)}
              </span>
            </div>
            <p className="text-dim text-xs">
              {en
                ? `From Bluetooth ${btFirst.value.toFixed(1)} (${btFirst.year}) to ${btLatest.value.toFixed(1)} (${btLatest.year}).`
                : `De Bluetooth ${btFirst.value.toFixed(1)} (${btFirst.year}) à ${btLatest.value.toFixed(1)} (${btLatest.year}).`}
            </p>
          </div>
        )}

        {brandShare.length > 0 && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 05 — Brands' : 'Section 05 — Marques'}
            </div>
            <h2 className="font-display font-semibold text-lg leading-snug mb-3">
              {en ? 'Who shaped the market?' : 'Qui a façonné le marché ?'}
            </h2>
            <div className="flex flex-col gap-2">
              {brandShare.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-xs text-dim w-20 shrink-0 truncate">{b.name}</span>
                  <div className="flex-1 h-2 bg-panel2 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="text-xs text-fg font-semibold w-9 text-right shrink-0">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {weightGrowth && (
          <div className="bg-panel border border-line rounded-base p-6 glow-accent-hover transition-shadow">
            <div className="path-indicator text-accent mb-2">
              {en ? 'Section 06 — Product evolution' : 'Section 06 — Évolution produit'}
            </div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h2 className="font-display font-semibold text-lg leading-snug">
                {en ? 'Generational weight shifts.' : 'Évolution du poids par génération.'}
              </h2>
              <span className={`font-display font-bold text-3xl shrink-0 ${weightGrowth.pct < 0 ? 'text-accent' : 'text-fg'}`}>
                {weightGrowth.pct > 0 ? '+' : ''}{weightGrowth.pct}%
              </span>
            </div>
            <p className="text-dim text-xs">
              {en
                ? `Average weight went from ${weightGrowth.startValue.toFixed(1)}g (${weightGrowth.startYear}) to ${weightGrowth.endValue.toFixed(1)}g (${weightGrowth.endYear}).`
                : `Le poids moyen est passé de ${weightGrowth.startValue.toFixed(1)}g (${weightGrowth.startYear}) à ${weightGrowth.endValue.toFixed(1)}g (${weightGrowth.endYear}).`}
            </p>
          </div>
        )}
      </div>

      {/* Graphes détaillés — déplacés depuis /timeline (fonctionnalité et
          logique de filtrage strictement inchangées, voir EvolutionExplorer
          et BrandComparisonChart). */}
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">
          {en ? 'Evolution over time' : 'Évolution dans le temps'}
        </h2>
        <EvolutionExplorer models={models} brands={brands} />
      </div>

      <div className="mb-14">
        <BrandComparisonChart models={models} brands={brands} />
      </div>

      <div className="text-center border-t border-line pt-10 mb-8">
        <h2 className="font-display font-bold text-xl mb-5">
          {en ? 'Explore the data' : 'Explorer les données'}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/ecouteurs" className="border border-accent/40 text-accent rounded-full px-5 py-2 text-sm hover:bg-accent/10 transition-colors">
            {en ? 'All Earbuds' : 'Tous les écouteurs'}
          </Link>
          <Link href="/timeline" className="border border-accent/40 text-accent rounded-full px-5 py-2 text-sm hover:bg-accent/10 transition-colors">
            Timeline
          </Link>
          <Link href="/marques" className="border border-accent/40 text-accent rounded-full px-5 py-2 text-sm hover:bg-accent/10 transition-colors">
            {en ? 'Brands' : 'Marques'}
          </Link>
        </div>
      </div>

      <Footer locale={locale} />
    </>
  );
}
