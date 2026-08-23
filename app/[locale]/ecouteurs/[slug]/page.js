import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Battery, BatteryFull, Droplet, Bluetooth, ShoppingCart, ExternalLink, TrendingUp } from 'lucide-react';
import { getEarbudBySlug, getGammeModels, getBrands, getAllEarbuds, getPublishedArticles } from '@/lib/queries';
import { findRelatedArticles } from '@/lib/relatedArticles';
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
import { Badge, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

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

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 mb-8">
          <div className="relative bg-panel2 border border-line rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            {m.image_url ? (
              <Image
                src={m.image_url}
                alt={m.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 180px"
                className="object-contain"
              />
            ) : (
              <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-20 h-20" />
            )}
          </div>
          <div>
            <div className="font-mono text-xs text-dim mb-2">
              {brand?.name || m.brand_id} · {m.gamme}
            </div>
            <h1 className="font-display font-bold text-[clamp(24px,3.4vw,34px)] mb-2 leading-tight">{m.name}</h1>
            <p className="text-accent text-[15px] mb-5">{displayTagline(m, locale)}</p>
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
                  className="bg-accent text-ink font-bold rounded-xl px-5 py-2.5 text-sm inline-flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{locale === 'en' ? 'Buy / Check Price' : "Acheter / Voir l'offre"}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              )}
              {prev && (
                <Link
                  href={`/comparaisons/${buildComparisonSlug(prev.id, m.id)}`}
                  className="border border-line hover:border-accent text-dim hover:text-fg rounded-xl px-4 py-2.5 text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{locale === 'en' ? `Compare vs ${prev.name}` : `Comparer vs ${prev.name}`}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-xl overflow-hidden mb-12">
          <KeySpec icon={Battery} value={fmtH(m.battery_bud_h)} label={t('earbudOnly')} />
          <KeySpec icon={BatteryFull} value={fmtH(m.battery_case_h)} label={t('withCase')} />
          <KeySpec icon={Droplet} value={m.water_rating} label={t('resistance')} />
          <KeySpec icon={Bluetooth} value={m.bluetooth} label={t('bluetooth')} />
        </div>

        <div className="bg-panel border border-line rounded-2xl px-5 pt-5 pb-1 mb-12">
          <h2 className="text-[15px] m-0 mb-1">{t('lineageTitle')}</h2>
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

        <Link href={`/annees/${yearOf(m.release_date)}`} className="inline-block text-accent text-xs hover:underline mb-8">
          {t('seeReleasedIn', { year: yearOf(m.release_date) })}
        </Link>

        <ComparisonSuggestions
          model={m}
          suggestions={comparisonSuggestions}
          bullets={comparisonBullets}
          brandOf={brandOf}
          locale={locale}
        />

        <RelatedArticles articles={relatedArticles} locale={locale} />

        <div className="bg-panel border border-dashed border-line rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap mb-5">
          <p className="m-0 text-[13.5px] text-dim">{t('ownAlready')}</p>
          <QuickCompareSelect currentId={m.id} brands={brands} allModels={allModels} placeholder={t('chooseModel')} />
        </div>
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
