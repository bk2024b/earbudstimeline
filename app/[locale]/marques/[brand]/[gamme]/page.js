import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ArrowRight, BatteryCharging, Cpu, DollarSign } from 'lucide-react';
import { getAllEarbuds, getBrandById, getEarbudsByBrand, getPublishedArticles } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { buildDiffBullets } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { findRelatedArticles } from '@/lib/relatedArticles';
import RelatedArticles from '@/components/RelatedArticles';
import { fmtDate, fmtMoney, yearOf, pct } from '@/lib/format';
import { slugify } from '@/lib/slug';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, JsonLd, canonicalFor } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import BrandBadge from '@/components/BrandBadge';
import EarbudsIcon from '@/components/EarbudsIcon';
import StatTile from '@/components/StatTile';
import LineageTechGraph from '@/components/LineageTechGraph';
import AdSlot from '@/components/AdSlot';
import { Stat, Footer } from '@/components/UI';

export const revalidate = 3600;

// Mêmes paires brand/gamme que celles listées dans app/sitemap.js — pré-
// générées au build (SSG) au lieu d'un rendu ISR à froid au premier hit.
export async function generateStaticParams() {
  const models = await getAllEarbuds();
  const gammeKeys = new Set(models.map((m) => `${m.brand_id}::${slugify(m.gamme)}`));
  return routing.locales.flatMap((locale) =>
    [...gammeKeys].map((key) => {
      const [brand, gamme] = key.split('::');
      return { locale, brand, gamme };
    })
  );
}

async function loadGamme(brandId, gammeSlug) {
  const brand = await getBrandById(brandId).catch(() => null);
  if (!brand) return { brand: null, gammeName: null, models: [] };

  const all = (await getEarbudsByBrand(brandId).catch(() => [])) || [];
  const models = all
    .filter((m) => m.gamme && slugify(m.gamme) === gammeSlug)
    .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));

  return { brand, gammeName: models[0]?.gamme || null, models };
}

export async function generateMetadata({ params }) {
  const { locale, brand: brandId, gamme: gammeSlug } = params;
  const { brand, gammeName, models } = await loadGamme(brandId, gammeSlug);
  if (!brand || models.length === 0) return { title: 'Not found — EarbudsTimeline' };

  const first = models[0];
  const last = models[models.length - 1];
  const period = first.id === last.id ? yearOf(first.release_date) : `${yearOf(first.release_date)}–${yearOf(last.release_date)}`;

  const title =
    locale === 'en'
      ? `${brand.name} ${gammeName} — All models and their evolution (${period}) | EarbudsTimeline`
      : `${brand.name} ${gammeName} — Tous les modèles et leur évolution (${period}) | EarbudsTimeline`;
  const description =
    locale === 'en'
      ? `Complete timeline of the ${brand.name} ${gammeName} line: ${models.length} model${models.length > 1 ? 's' : ''} from ${period}, generation-by-generation evolution, battery life, ANC and price.`
      : `Chronologie complète de la gamme ${brand.name} ${gammeName} : ${models.length} modèle${models.length > 1 ? 's' : ''} de ${period}, évolution génération par génération, autonomie, ANC et prix.`;

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/marques/${brandId}/${gammeSlug}`),
    openGraph: {
      title: `${brand.name} ${gammeName} — EarbudsTimeline`,
      description: `${models.length} model${models.length > 1 ? 's' : ''} tracked, from ${period}.`,
      images: first.image_url ? [first.image_url] : undefined,
    },
  };
}

export default async function GammePage({ params }) {
  const { locale, brand: brandId, gamme: gammeSlug } = params;
  const { brand, gammeName, models } = await loadGamme(brandId, gammeSlug);
  if (!brand || models.length === 0) notFound();

  const [articles, t, tDiff] = await Promise.all([
    getPublishedArticles(locale),
    getTranslations({ locale, namespace: 'gammePage' }),
    getTranslations({ locale, namespace: 'diff' }),
  ]);
  const relatedArticles = findRelatedArticles(articles, [brand.name, gammeName]);

  const first = models[0];
  const last = models[models.length - 1];
  const stats = computeStats(models);
  const isSingle = models.length === 1;
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  const priceDelta = first.price && last.price && !isSingle ? pct(last.price, first.price) : null;
  const battDelta = !isSingle ? pct(Number(last.battery_case_h), Number(first.battery_case_h)) : null;
  const gainedAnc = !isSingle && last.anc && !first.anc;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: brand.name, url: `/marques/${brand.id}` },
          { name: gammeName, url: `/marques/${brand.id}/${gammeSlug}` },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${brand.name} ${gammeName}`,
          url: `/marques/${brand.id}/${gammeSlug}`,
          locale,
          items: models.map((m) => ({ url: `/ecouteurs/${m.id}`, name: m.name })),
        })}
      />

      <Link href={`/marques/${brand.id}`} className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        {t('backToAll', { brand: brand.name })}
      </Link>

      <div className="flex items-center gap-3 mb-3">
        <BrandBadge brand={brand} size={32} />
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">
          {t('eyebrow', { brand: brand.name })}
        </div>
      </div>
      <h1 className="font-display font-bold text-[32px] leading-tight mb-5">{gammeName}</h1>

      <div className="flex gap-8 flex-wrap mb-8">
        <Stat value={models.length} label={t('models', { count: models.length })} />
        <Stat
          value={first.id === last.id ? yearOf(first.release_date) : `${yearOf(first.release_date)} → ${yearOf(last.release_date)}`}
          label={t('period')}
        />
        {stats.avgPrice && <Stat value={`${stats.avgPrice} $`} label={t('avgPrice')} />}
      </div>

      <p className="text-dim text-[14.5px] max-w-[720px] mb-10 leading-relaxed">
        {isSingle ? (
          <>
            {t('singleIntroPrefix', { gamme: gammeName, brand: brand.name })}
            <b className="text-fg">{first.name}</b>
            {t('singleIntroSuffix', { year: yearOf(first.release_date) })}
            {first.price && t('singlePriceClause', { price: fmtMoney(first.price) })}.
          </>
        ) : (
          <>
            {t('multiIntro', {
              gamme: gammeName,
              brand: brand.name,
              count: models.length,
              first: first.name,
              firstYear: yearOf(first.release_date),
              last: last.name,
              lastYear: yearOf(last.release_date),
            })}
            {gainedAnc && t('gainedAnc')}
            {battDelta !== null && Math.abs(battDelta) >= 10 && t('batteryEvolved', { sign: battDelta > 0 ? '+' : '', value: battDelta })}
            {priceDelta !== null && Math.abs(priceDelta) >= 10 &&
              (priceDelta > 0 ? t('priceIncreased', { value: Math.abs(priceDelta) }) : t('priceDecreased', { value: Math.abs(priceDelta) }))}
          </>
        )}
      </p>

      {!isSingle && (
        <aside className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label={t('avgBattery')} />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label={t('commonBt')} />
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label={t('avgPrice')} />}
        </aside>
      )}

      <LineageTechGraph
        brand={brand}
        brandId={brand.id}
        gammeName={gammeName}
        gammeSlug={gammeSlug}
        models={models}
        locale={locale}
      />

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('chronology')}</h2>
      <div className="flex flex-col gap-0 mb-12">
        {models.map((m, i) => (
          <div key={m.id} className="flex items-stretch">
            <div className="flex flex-col items-center mr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-accent mt-6 shrink-0" />
              {i < models.length - 1 && <span className="flex-1 w-px bg-line" />}
            </div>
            <Link
              href={`/ecouteurs/${m.id}`}
              className="flex-1 flex items-center gap-4 bg-panel border border-line rounded-xl p-4 mb-3 hover:border-accent transition-colors"
            >
              <div className="relative w-14 h-14 rounded-lg bg-panel2 flex items-center justify-center overflow-hidden shrink-0">
                {m.image_url ? (
                  <Image src={m.image_url} alt="" fill sizes="56px" className="object-contain p-1.5" />
                ) : (
                  <EarbudsIcon color={brand.color} className="w-8 h-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-medium text-[14.5px] truncate">{m.name}</p>
                <p className="m-0 text-dim text-xs mt-0.5">
                  {fmtDate(m.release_date, locale)} · {fmtMoney(m.price)} · {m.anc ? t('ancShort') : t('noAncShort')}
                </p>
              </div>
              {m.marquant && <span className="text-amber text-xs shrink-0">★</span>}
            </Link>
          </div>
        ))}
      </div>

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      {!isSingle && (
        <>
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{t('genByGen')}</h2>
          <div className="flex flex-col gap-3 mb-12">
            {models.slice(1).map((cur, i) => {
              const prev = models[i];
              const bullets = buildDiffBullets(cur, prev, tDiff);
              return (
                <div key={cur.id} className="bg-panel border border-line rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[13.5px] mb-2.5 flex-wrap">
                    <span className="text-dim">{prev.name}</span>
                    <ArrowRight size={13} className="text-dim shrink-0" />
                    <span className="font-medium">{cur.name}</span>
                    <Link
                      href={`/comparaisons/${buildComparisonSlug(prev.id, cur.id)}`}
                      className="ml-auto text-accent text-xs hover:underline shrink-0"
                    >
                      {t('compare')}
                    </Link>
                  </div>
                  {bullets.length === 0 ? (
                    <p className="text-dim text-xs m-0">{t('fewChanges')}</p>
                  ) : (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 m-0 p-0 list-none">
                      {bullets.map((b, j) => (
                        <li key={j} className="text-xs text-dim flex items-center gap-1.5">
                          <span
                            className={
                              b.sign === '+' ? 'text-accent' : b.sign === '-' ? 'text-rose-400' : 'text-dim'
                            }
                          >
                            {b.sign}
                          </span>
                          {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <RelatedArticles articles={relatedArticles} locale={locale} />

      <Footer locale={locale} />
    </>
  );
}
