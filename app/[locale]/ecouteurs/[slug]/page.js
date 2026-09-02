import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Battery, BatteryFull, Droplet, Bluetooth, ShoppingCart, ExternalLink, TrendingUp } from 'lucide-react';
import { getEarbudBySlug, getGammeModels, getBrands, getAllEarbuds, getPublishedArticles } from '@/lib/queries';
import { findRelatedArticles } from '@/lib/relatedArticles';
import { getModelsByYear } from '@/lib/sameYear';
import { buildCuriosityInsight } from '@/lib/curiosity';
import { fmtDate, fmtH, fmtG, fmtMoney, yearOf, pct, displayTagline } from '@/lib/format';
import { getComparisonSuggestions, buildDiffBullets } from '@/lib/compare';
import { slugify } from '@/lib/slug';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { buildProductJsonLd, buildBreadcrumbJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import QuickCompareSelect from '@/components/QuickCompareSelect';
import ComparisonSuggestions from '@/components/ComparisonSuggestions';
import RelatedArticles from '@/components/RelatedArticles';
import EarbudsIcon from '@/components/EarbudsIcon';
import TimelinePosition from '@/components/TimelinePosition';
import EntityGraph from '@/components/EntityGraph';
import SameYearHook from '@/components/SameYearHook';
import NextExploration from '@/components/NextExploration';
import ExploreThisStory from '@/components/ExploreThisStory';
import CuriosityHook from '@/components/CuriosityHook';
import EvolutionHook from '@/components/EvolutionHook';
import DataHook from '@/components/DataHook';
import TechnologyHook from '@/components/TechnologyHook';
import AdSlot from '@/components/AdSlot';
import { Badge, Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const models = await getAllEarbuds();
    return models.map((m) => ({ slug: m.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const m = await getEarbudBySlug(slug).catch(() => null);
  if (!m) return { title: 'Not found — EarbudsTimeline' };

  const brands = await getBrands().catch(() => []);
  const brand = (brands || []).find((b) => b.id === m.brand_id);
  const year = yearOf(m.release_date);
  const tagline = displayTagline(m, locale);

  const title =
    locale === 'en'
      ? `${m.name} — Full specs and comparisons | EarbudsTimeline`
      : `${m.name} — Fiche complète, specs et comparaisons | EarbudsTimeline`;
  const description =
    locale === 'en'
      ? `${m.name} (${brand?.name || m.brand_id}${year ? `, ${year}` : ''}): ${tagline} Battery life, ANC, Bluetooth, launch price and comparisons.`
      : `${m.name} (${brand?.name || m.brand_id}${year ? `, ${year}` : ''}) : ${tagline} Autonomie, ANC, Bluetooth, prix au lancement et comparaisons.`;

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/ecouteurs/${m.id}`),
    openGraph: {
      title: `${m.name} — ${brand?.name || m.brand_id}`,
      description: tagline,
      images: m.image_url ? [m.image_url] : undefined,
    },
  };
}

export default async function ModelPage({ params }) {
  const { locale, slug } = params;
  const m = await getEarbudBySlug(slug).catch(() => null);
  if (!m) notFound();

  const [rawLineup, brands, allModels, articles, t, tc, tComp, tDiff] = await Promise.all([
    getGammeModels(m.brand_id, m.gamme).catch(() => []),
    getBrands().catch(() => []),
    getAllEarbuds().catch(() => []),
    getPublishedArticles(locale).catch(() => []),
    getTranslations({ locale, namespace: 'product' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'comparisonSuggestions' }),
    getTranslations({ locale, namespace: 'diff' }),
  ]);

  const lineup = Array.isArray(rawLineup) && rawLineup.length > 0 ? rawLineup : [m];
  const brand = (brands || []).find((b) => b.id === m.brand_id);
  const first = lineup[0] || m;
  const isFirst = first.id === m.id;
  const idx = lineup.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? lineup[idx - 1] : null;
  const next = idx >= 0 && idx < lineup.length - 1 ? lineup[idx + 1] : null;
  const brandOf = (id) => (brands || []).find((b) => b.id === id);
  const comparisonSuggestions = getComparisonSuggestions(m, { prev, next, allModels: allModels || [], t: tComp });
  const comparisonBullets = comparisonSuggestions.length > 0 ? buildDiffBullets(m, comparisonSuggestions[0].model, tDiff) : [];
  const relatedArticles = findRelatedArticles(articles || [], [brand?.name || m.brand_id, m.gamme, m.name]);
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const releaseYear = yearOf(m.release_date);
  const sameYearModels = getModelsByYear(allModels, releaseYear, m.id);
  const curiosityInsight = buildCuriosityInsight(m, prev, { locale });
  const rival = comparisonSuggestions.find((s) => s.reason === tComp('reasonRival')) || comparisonSuggestions[0];

  // Next Exploration : composition pure de liens déjà calculés ci-dessus,
  // aucune nouvelle donnée. "Continue" suit la lignée chronologique, "Deeper"
  // va vers la marque, "Sideways" vers le rival déjà identifié par
  // getComparisonSuggestions.
  const continueItem = next
    ? { title: next.name, subtitle: locale === 'en' ? 'Next generation' : 'Génération suivante', href: `/ecouteurs/${next.id}` }
    : { title: locale === 'en' ? 'Explore the full timeline' : 'Explorer la timeline complète', href: '/timeline' };
  const deeperItem = {
    title: brand?.name || m.brand_id,
    subtitle: locale === 'en' ? `All ${brand?.name || m.brand_id} earbuds` : `Tous les écouteurs ${brand?.name || m.brand_id}`,
    href: `/marques/${m.brand_id}`,
  };
  const sidewaysItem = rival
    ? { title: rival.model.name, subtitle: rival.reason, href: `/comparaisons/${buildComparisonSlug(m.id, rival.model.id)}` }
    : { title: locale === 'en' ? 'Browse comparisons' : 'Parcourir les comparaisons', href: '/comparaisons' };

  function metric(label, key, higherIsBetter, fmt) {
    const cur = Number(m[key]) || 0;
    const base = Number(first?.[key]) || cur;
    const values = lineup.map((x) => Number(x[key])).filter((v) => Number.isFinite(v));
    const best = values.length > 0 ? (higherIsBetter ? Math.max(...values) : Math.min(...values)) : cur;
    const isRecord = cur === best && lineup.length > 1;
    const d = isFirst ? null : pct(cur, base);

    return (
      <div key={key} className="flex justify-between items-center py-3.5 border-t border-line gap-2.5 flex-wrap">
        <div className="text-dim text-[13px] min-w-[140px]">{label}</div>
        <div className="font-mono text-sm flex items-center gap-2.5 flex-wrap">
          {fmt(cur)}
          {d !== null && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                d > 0 ? 'text-accent bg-accent/15' : d < 0 ? 'text-rose-400 bg-rose-400/15' : 'text-dim bg-panel2'
              }`}
            >
              {d > 0 ? '+' : ''}
              {d}% {t('sinceFirst')}
            </span>
          )}
          {isRecord && <span className="text-xs px-1.5 py-0.5 rounded text-accent bg-accent/15">{t('lineRecord')}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <JsonLd data={buildProductJsonLd(m, brand, locale)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: brand?.name || m.brand_id, url: `/marques/${m.brand_id}` },
          { name: m.name, url: `/ecouteurs/${m.id}` },
        ], locale)}
      />
      <div>
        <Link
          href={`/marques/${m.brand_id}`}
          className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent"
        >
          ← {t('allOf', { brand: brand?.name || m.brand_id })}
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 mb-8 items-center">
          <div className="relative group bg-panel2 border border-line rounded-base aspect-square flex items-center justify-center overflow-hidden p-4">
            <div className="absolute inset-0 bg-radial from-accent/10 to-transparent pointer-events-none" />
            {m.image_url ? (
              <Image
                src={m.image_url}
                alt={m.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 200px"
                className="object-contain p-4 floating-hardware"
              />
            ) : (
              <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-24 h-24" />
            )}
          </div>
          <div>
            <div className="font-mono text-xs text-accent uppercase tracking-wider mb-2 font-semibold flex items-center gap-2">
              <span>{brand?.name || m.brand_id}</span>
              {m.gamme && <span className="text-dim">/ {m.gamme}</span>}
            </div>
            <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] mb-2 leading-tight text-fg">{m.name}</h1>
            <p className="text-dim text-[15px] mb-5 leading-relaxed">{displayTagline(m, locale)}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge>{fmtDate(m.release_date, locale)}</Badge>
              {m.marquant && <Badge gold>{t('notableModel')}</Badge>}
              <Badge>
                {fmtMoney(m.price)} {t('atLaunch')}
              </Badge>
              <Badge>{m.anc ? t('withAnc') : t('withoutAnc')}</Badge>
            </div>

            <div className="flex gap-3 flex-wrap items-center mt-5">
              {m.buy_url && (
                <a
                  href={m.buy_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn-primary"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{locale === 'en' ? 'Buy / Check Price' : "Acheter / Voir l'offre"}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              )}
              {prev && (
                <Link
                  href={`/comparaisons/${buildComparisonSlug(prev.id, m.id)}`}
                  className="btn-ghost text-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  <span>{locale === 'en' ? `Compare vs ${prev.name}` : `Comparer vs ${prev.name}`}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ⏳ Evolution Hook (Before/After) */}
        <EvolutionHook
          prevModel={prev}
          currentModel={m}
          nextModel={next}
          locale={locale}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-base overflow-hidden mb-10">
          <KeySpec icon={Battery} value={fmtH(m.battery_bud_h)} label={t('earbudOnly')} />
          <KeySpec icon={BatteryFull} value={fmtH(m.battery_case_h)} label={t('withCase')} />
          <KeySpec icon={Droplet} value={m.water_rating} label={t('resistance')} />
          <KeySpec icon={Bluetooth} value={m.bluetooth} label={t('bluetooth')} />
        </div>

        <CuriosityHook insight={curiosityInsight} />

        {/* 📊 Data Hook for battery or notable stat */}
        {Number(m.battery_bud_h) >= 8 && (
          <DataHook
            label={locale === 'en' ? 'Battery Benchmark' : "Repère d'autonomie"}
            value={fmtH(m.battery_bud_h)}
            comparisonText={
              locale === 'en'
                ? `Offering ${fmtH(m.battery_bud_h)} per charge placed this model well above the historical average of early generations (~4-5h).`
                : `Avec ${fmtH(m.battery_bud_h)} par charge, ce modèle se situe nettement au-dessus de la moyenne des premières générations (~4-5h).`
            }
            href="/insights"
            ctaText={locale === 'en' ? 'See battery evolution insights →' : "Voir l'évolution de l'autonomie →"}
            locale={locale}
          />
        )}

        {/* 🔬 Technology Hook for ANC if model features ANC */}
        {m.anc && (
          <TechnologyHook
            techName={locale === 'en' ? 'Active Noise Cancellation (ANC)' : 'Réduction active du bruit (ANC)'}
            description={
              locale === 'en'
                ? 'ANC became the defining battlefield of premium wireless earbuds starting in 2019.'
                : "La réduction active du bruit s'est imposée dès 2019 comme le champ de bataille technologique majeur des écouteurs haut de gamme."
            }
            yearEra={`${releaseYear || '2019'} → 2026`}
            href="/technologies/anc"
            locale={locale}
          />
        )}

        <div className="hardware-card bg-panel p-5 sm:p-6 mb-12">
          <h2 className="text-base sm:text-lg font-display font-bold text-fg m-0 mb-1">{t('lineageTitle')}</h2>
          <p className="text-dim text-xs m-0 mb-4">
            {isFirst
              ? t('firstInLine', { gamme: m.gamme })
              : t('trackedSince', { name: first?.name || m.name, year: yearOf(first?.release_date || m.release_date) })}
          </p>
          {lineup.length === 1 ? (
            <p className="text-dim text-[13.5px] py-4">{t('onlyModel')}</p>
          ) : (
            <>
              {metric(t('metricBatteryEarbud'), 'battery_bud_h', true, fmtH)}
              {metric(t('metricBatteryTotal'), 'battery_case_h', true, fmtH)}
              {metric(t('metricWeight'), 'weight_g', false, fmtG)}
              {metric(t('metricPrice'), 'price', false, fmtMoney)}
            </>
          )}
        </div>

        <EntityGraph model={m} brand={brand} prev={prev} next={next} locale={locale} />

        <ExploreThisStory
          lineup={lineup}
          currentId={m.id}
          brandId={m.brand_id}
          brandName={brand?.name || m.brand_id}
          gammeName={m.gamme}
          gammeSlug={slugify(m.gamme)}
          locale={locale}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <SpecGroup title={t('audioGroup')}>
            <SpecLine k={t('chip')} v={m.chip} />
            <SpecLine
              k={t('codecs')}
              v={m.codec}
              href={m.codec && m.codec !== '—' ? `/technologies/codecs/${slugify(m.codec.split(',')[0].trim())}` : undefined}
            />
            <SpecLine k={t('noiseCancelling')} v={m.anc ? tc('yes') : tc('no')} href={m.anc ? '/technologies/anc' : undefined} />
          </SpecGroup>
          <SpecGroup title={t('connectivityGroup')}>
            <SpecLine k={t('bluetooth')} v={m.bluetooth} href={m.bluetooth ? `/technologies/bluetooth/${m.bluetooth}` : undefined} />
            <SpecLine k={t('usbC')} v={m.usb_c ? tc('yes') : tc('no')} href={m.usb_c ? '/technologies/usb-c' : undefined} />
            <SpecLine k={t('multipoint')} v={m.multipoint ? tc('yes') : tc('no')} href={m.multipoint ? '/technologies/multipoint' : undefined} />
          </SpecGroup>
          <SpecGroup title={t('comfortGroup')}>
            <SpecLine k={t('weightPerEarbud')} v={fmtG(m.weight_g)} />
            <SpecLine k={t('certification')} v={m.water_rating} />
          </SpecGroup>
          <SpecGroup title={t('batteryGroup')}>
            <SpecLine k={t('earbudOnly')} v={fmtH(m.battery_bud_h)} />
            <SpecLine k={t('withCase')} v={fmtH(m.battery_case_h)} />
          </SpecGroup>
          <SpecGroup title={t('generalGroup')}>
            <SpecLine k={t('releaseDate')} v={fmtDate(m.release_date, locale)} />
            <SpecLine k={t('launchPrice')} v={fmtMoney(m.price)} />
          </SpecGroup>
        </div>

        <AdSlot
          variant="native"
          zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
          invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
          label={locale === 'en' ? 'Advertisement' : 'Publicité'}
        />

        <ComparisonSuggestions
          model={m}
          suggestions={comparisonSuggestions}
          bullets={comparisonBullets}
          brandOf={brandOf}
          locale={locale}
        />

        <SameYearHook year={releaseYear} models={sameYearModels} brandOf={brandOf} locale={locale} />

        <RelatedArticles articles={relatedArticles} locale={locale} />

        <div className="bg-panel border border-dashed border-line rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap mb-5">
          <p className="m-0 text-[13.5px] text-dim">{t('ownAlready')}</p>
          <QuickCompareSelect currentId={m.id} brands={brands} allModels={allModels} placeholder={t('chooseModel')} />
        </div>

        <NextExploration continueItem={continueItem} deeperItem={deeperItem} sidewaysItem={sidewaysItem} locale={locale} />
      </div>

      <aside className="flex flex-col gap-5">
        {(prev || next) && <TimelinePosition prev={prev} current={m} next={next} gammeName={m.gamme} locale={locale} />}
      </aside>

      <div className="lg:col-span-2">
        <Footer locale={locale} />
      </div>
    </div>
  );
}

function KeySpec({ icon: Icon, value, label }) {
  return (
    <div className="bg-panel px-4 py-4.5 flex items-center gap-3">
      <Icon size={18} className="text-accent shrink-0" />
      <div>
        <b className="block font-display text-lg leading-tight">{value}</b>
        <span className="text-dim text-[11px] uppercase tracking-[0.06em]">{label}</span>
      </div>
    </div>
  );
}

function SpecGroup({ title, children }) {
  return (
    <div>
      <h3 className="text-[12.5px] uppercase tracking-[0.08em] text-dim mb-2.5">{title}</h3>
      {children}
    </div>
  );
}

function SpecLine({ k, v, href }) {
  return (
    <div className="flex justify-between py-2.5 border-t border-line text-[13.5px]">
      <span className="text-dim">{k}</span>
      {href ? (
        <Link href={href} className="font-mono text-accent hover:underline">
          {v}
        </Link>
      ) : (
        <span className="font-mono">{v}</span>
      )}
    </div>
  );
}
