import { Link, redirect } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { fmtH, fmtG, fmtMoney, yearOf } from '@/lib/format';
import { parseComparisonSlug, buildComparisonSlug, isCanonicalSlug } from '@/lib/compareSlug';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, ogDefaults, JsonLd } from '@/lib/seo';
import EarbudsIcon from '@/components/EarbudsIcon';
import EntityGraph from '@/components/EntityGraph';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

async function loadPair(slug) {
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return { a: null, b: null, brands: [], models: [] };

  const [models, brands] = await Promise.all([
    getAllEarbuds().catch(() => []),
    getBrands().catch(() => []),
  ]);
  const a = (models || []).find((m) => m.id === parsed[0]);
  const b = (models || []).find((m) => m.id === parsed[1]);
  return { a, b, brands: brands || [], models: models || [] };
}

// Position d'un modèle dans sa propre lignée (même brand_id + gamme),
// pour réutiliser EntityGraph dans le comparateur sans requête supplémentaire :
// `models` est déjà chargé une fois pour toute la page via loadPair.
function lineagePosition(model, models) {
  if (!model) return { prev: null, next: null };
  const lineup = (models || [])
    .filter((x) => x.brand_id === model.brand_id && x.gamme === model.gamme)
    .sort((x, y) => (x.release_date || '').localeCompare(y.release_date || ''));
  const idx = lineup.findIndex((x) => x.id === model.id);
  return { prev: idx > 0 ? lineup[idx - 1] : null, next: idx >= 0 && idx < lineup.length - 1 ? lineup[idx + 1] : null };
}

// Calcule les 1-2 différences les plus notables entre deux modèles, pour générer
// une meta description unique par paire plutôt qu'un texte générique répété sur
// toutes les pages de comparaison. Priorité : ANC (feature binaire très recherchée)
// > prix (le plus décisif pour le clic) > autonomie > poids. Retourne un tableau
// de phrases déjà formulées dans la langue demandée, prêtes à être jointes.
function topDifferentiators(a, b, locale) {
  const totalBatt = (m) => (Number(m.battery_bud_h) || 0) + (Number(m.battery_case_h) || 0);
  const battA = totalBatt(a);
  const battB = totalBatt(b);
  const battDiff = Math.round(Math.abs(battA - battB) * 10) / 10;
  const priceDiff = Math.abs((Number(a.price) || 0) - (Number(b.price) || 0));
  const weightDiff = Math.abs((Number(a.weight_g) || 0) - (Number(b.weight_g) || 0));
  const ancMismatch = Boolean(a.anc) !== Boolean(b.anc);

  const winner = (condition) => (condition ? a : b);
  const phrases = [];

  if (ancMismatch) {
    const withAnc = a.anc ? a : b;
    const withoutAnc = a.anc ? b : a;
    phrases.push(
      locale === 'en'
        ? `${withAnc.name} has ANC, ${withoutAnc.name} doesn't`
        : `${withAnc.name} a l'ANC, pas ${withoutAnc.name}`
    );
  }

  if (priceDiff >= 5 && a.price && b.price) {
    const cheaper = winner(a.price < b.price);
    phrases.push(
      locale === 'en'
        ? `${cheaper.name} is $${priceDiff} cheaper`
        : `${cheaper.name} coûte ${priceDiff} $ de moins`
    );
  }

  if (battDiff >= 1 && battA && battB) {
    const longer = winner(battA > battB);
    phrases.push(
      locale === 'en'
        ? `${longer.name} lasts ${fmtH(battDiff)} longer`
        : `${longer.name} tient ${fmtH(battDiff)} de plus`
    );
  }

  if (weightDiff >= 3 && a.weight_g && b.weight_g && phrases.length < 2) {
    const lighter = winner(a.weight_g < b.weight_g);
    phrases.push(
      locale === 'en'
        ? `${lighter.name} is ${fmtG(weightDiff)} lighter`
        : `${lighter.name} pèse ${fmtG(weightDiff)} de moins`
    );
  }

  return phrases.slice(0, 2);
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const { a, b, brands } = await loadPair(slug);
  if (!a || !b) return { title: 'Not found — EarbudsTimeline' };

  const brandName = (id) => brands.find((br) => br.id === id)?.name || id;
  const diffs = topDifferentiators(a, b, locale);

  const title = `${a.name} vs ${b.name} — ${locale === 'en' ? 'Full comparison' : 'Comparatif complet'} | EarbudsTimeline`;

  const genericTail =
    locale === 'en'
      ? 'battery life, noise cancellation, weight, price, USB-C, multipoint and codecs compared in detail.'
      : 'autonomie, réduction de bruit, poids, prix, USB-C, multipoint et codecs comparés en détail.';

  const description = diffs.length
    ? `${a.name} (${brandName(a.brand_id)}) vs ${b.name} (${brandName(b.brand_id)}): ${diffs.join(', ')}. ${
        locale === 'en' ? 'Full spec comparison inside.' : 'Comparatif complet des caractéristiques.'
      }`
    : `${a.name} (${brandName(a.brand_id)}) ${locale === 'en' ? 'vs' : 'contre'} ${b.name} (${brandName(b.brand_id)}): ${genericTail}`;

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/comparaisons/${buildComparisonSlug(a.id, b.id)}`),
    openGraph: {
      ...ogDefaults(`/${locale}/comparaisons/${buildComparisonSlug(a.id, b.id)}`, locale),
      title: `${a.name} vs ${b.name}`,
      description: locale === 'en' ? `Full comparison between the ${a.name} and the ${b.name}.` : `Comparatif complet entre le ${a.name} et le ${b.name}.`,
      images: [a.image_url || b.image_url || '/og-image.png'],
    },
  };
}

export default async function ComparisonPage({ params }) {
  const { locale, slug } = params;
  const { a, b, brands, models } = await loadPair(slug);
  if (!a || !b) notFound();

  if (!isCanonicalSlug(slug)) {
    redirect({ href: `/comparaisons/${buildComparisonSlug(a.id, b.id)}`, locale });
  }

  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'comparisonPage' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const brandOf = (id) => brands.find((br) => br.id === id);
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';
  const yn = (v) => (v ? tc('yes') : tc('no'));
  const posA = lineagePosition(a, models);
  const posB = lineagePosition(b, models);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: locale === 'en' ? 'Comparisons' : 'Comparaisons', url: '/comparaisons' },
          { name: `${a.name} vs ${b.name}`, url: `/comparaisons/${slug}` },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${a.name} vs ${b.name}`,
          url: `/comparaisons/${slug}`,
          locale,
          items: [
            { url: `/ecouteurs/${a.id}`, name: a.name },
            { url: `/ecouteurs/${b.id}`, name: b.name },
          ],
        })}
      />

      <Link href="/comparaisons" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        {t('backToAll')}
      </Link>

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{t('eyebrow')}</div>
      <h1 className="font-display font-bold text-[28px] sm:text-[32px] mb-6 leading-tight">
        {a.name} <span className="text-dim font-normal">{tc('vs')}</span> {b.name}
      </h1>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Head m={a} brand={brandOf(a.brand_id)} />
        <Head m={b} brand={brandOf(b.brand_id)} />
        <span className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-page border border-line text-dim text-[11px] font-mono">
          VS
        </span>
      </div>

      <div className="bg-panel border border-line rounded-2xl px-5 mb-6">
        <Row label={t('batteryEarbud')} a={a.battery_bud_h} b={b.battery_bud_h} higher fmt={fmtH} />
        <Row label={t('batteryTotal')} a={a.battery_case_h} b={b.battery_case_h} higher fmt={fmtH} />
        <Row label={t('weight')} a={a.weight_g} b={b.weight_g} fmt={fmtG} />
        <Row label={t('launchPrice')} a={a.price} b={b.price} fmt={fmtMoney} />
        <RawRow label={t('anc')} a={yn(a.anc)} b={yn(b.anc)} />
        <RawRow label={t('certification')} a={a.water_rating} b={b.water_rating} />
        <RawRow label={t('bluetooth')} a={a.bluetooth} b={b.bluetooth} />
        <RawRow label={t('usbC')} a={yn(a.usb_c)} b={yn(b.usb_c)} />
        <RawRow label={t('multipoint')} a={yn(a.multipoint)} b={yn(b.multipoint)} />
        <RawRow label={t('codecs')} a={a.codec} b={b.codec} last />
      </div>

      <Link href={`/comparer?a=${a.id}&b=${b.id}`} className="inline-block text-accent text-xs hover:underline mb-8">
        {t('editThis')}
      </Link>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">
        {locale === 'en' ? 'Where each model sits' : 'Position de chaque modèle'}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EntityGraph model={a} brand={brandOf(a.brand_id)} prev={posA.prev} next={posA.next} locale={locale} />
        <EntityGraph model={b} brand={brandOf(b.brand_id)} prev={posB.prev} next={posB.next} locale={locale} />
      </div>

      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_COMPARISON_KEY}
        invokeDomain="pl30973227.profitableratecpmnetwork.com"
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />

      <Footer locale={locale} />
    </>
  );
}

function Head({ m, brand }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3.5">
        <div className="relative bg-panel2 rounded-xl w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden">
          {m.image_url ? (
            <Image src={m.image_url} alt="" fill sizes="56px" className="object-contain p-1.5" />
          ) : (
            <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-9 h-9" />
          )}
        </div>
        <div>
          <Link href={`/ecouteurs/${m.id}`} className="hover:text-accent">
            <h2 className="m-0 mb-0.5 text-[15px] leading-tight">{m.name}</h2>
          </Link>
          <p className="m-0 text-dim text-xs">
            {brand?.name || m.brand_id} · {yearOf(m.release_date)}
          </p>
        </div>
      </div>
      {m.buy_url && (
        <a
          href={m.buy_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 bg-accent text-ink font-semibold rounded-lg px-3.5 py-2 text-xs hover:opacity-90 transition-opacity self-start"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Acheter</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}
    </div>
  );
}

function Row({ label, a, b, fmt, higher, last }) {
  const na = Number(a);
  const nb = Number(b);
  const aWins = higher ? na > nb : na < nb;
  const bWins = higher ? nb > na : nb < na;
  return (
    <div
      className={`grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] gap-2 py-3.5 items-center text-[13.5px] ${
        last ? '' : 'border-b border-line'
      }`}
    >
      <div className="text-dim text-xs">{label}</div>
      <div className={`font-mono px-2 py-1 rounded ${aWins ? 'bg-accent/15 text-accent' : ''}`}>{fmt(a)}</div>
      <div className={`font-mono px-2 py-1 rounded ${bWins ? 'bg-accent/15 text-accent' : ''}`}>{fmt(b)}</div>
    </div>
  );
}

function RawRow({ label, a, b, last }) {
  return (
    <div
      className={`grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] gap-2 py-3.5 items-center text-[13.5px] ${
        last ? '' : 'border-b border-line'
      }`}
    >
      <div className="text-dim text-xs">{label}</div>
      <div className="font-mono px-2 py-1 rounded">{a}</div>
      <div className="font-mono px-2 py-1 rounded">{b}</div>
    </div>
  );
}
