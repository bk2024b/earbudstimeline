import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BatteryCharging, Cpu, DollarSign } from 'lucide-react';
import { getBrandById, getEarbudsByBrand, getPublishedArticles } from '@/lib/queries';
import { computeStats } from '@/lib/stats';
import { buildDiffBullets } from '@/lib/compare';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { findRelatedArticles } from '@/lib/relatedArticles';
import RelatedArticles from '@/components/RelatedArticles';
import { fmtDate, fmtMoney, yearOf, pct } from '@/lib/format';
import { slugify } from '@/lib/slug';
import { buildBreadcrumbJsonLd, JsonLd, absoluteUrl } from '@/lib/seo';
import BrandBadge from '@/components/BrandBadge';
import EarbudsIcon from '@/components/EarbudsIcon';
import StatTile from '@/components/StatTile';
import { Stat, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

async function loadGamme(brandId, gammeSlug) {
  const brand = await getBrandById(brandId).catch(() => null);
  if (!brand) return { brand: null, gammeName: null, models: [] };

  const all = await getEarbudsByBrand(brandId);
  const models = all
    .filter((m) => slugify(m.gamme) === gammeSlug)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));

  return { brand, gammeName: models[0]?.gamme || null, models };
}

export async function generateMetadata({ params }) {
  const { brand, gammeName, models } = await loadGamme(params.brand, params.gamme);
  if (!brand || models.length === 0) return { title: 'Gamme introuvable — EarbudsTimeline' };

  const first = models[0];
  const last = models[models.length - 1];
  const period = first.id === last.id ? yearOf(first.release_date) : `${yearOf(first.release_date)}–${yearOf(last.release_date)}`;

  return {
    title: `${brand.name} ${gammeName} — Tous les modèles et leur évolution (${period}) | EarbudsTimeline`,
    description: `Chronologie complète de la gamme ${brand.name} ${gammeName} : ${models.length} modèle${models.length > 1 ? 's' : ''} de ${period}, évolution génération par génération, autonomie, ANC et prix.`,
    openGraph: {
      title: `${brand.name} ${gammeName} — EarbudsTimeline`,
      description: `${models.length} modèle${models.length > 1 ? 's' : ''} référencé${models.length > 1 ? 's' : ''}, de ${period}.`,
      images: first.image_url ? [first.image_url] : undefined,
    },
  };
}

export default async function GammePage({ params }) {
  const { brand, gammeName, models } = await loadGamme(params.brand, params.gamme);
  if (!brand || models.length === 0) notFound();

  const articles = await getPublishedArticles();
  const relatedArticles = findRelatedArticles(articles, [brand.name, gammeName]);

  const first = models[0];
  const last = models[models.length - 1];
  const stats = computeStats(models);
  const isSingle = models.length === 1;

  const priceDelta = first.price && last.price && !isSingle ? pct(last.price, first.price) : null;
  const battDelta = !isSingle ? pct(Number(last.battery_case_h), Number(first.battery_case_h)) : null;
  const gainedAnc = !isSingle && last.anc && !first.anc;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: brand.name, url: `/marques/${brand.id}` },
          { name: gammeName, url: `/marques/${brand.id}/${params.gamme}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${brand.name} ${gammeName}`,
          itemListElement: models.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(`/ecouteurs/${m.id}`),
            name: m.name,
          })),
        }}
      />

      <Link href={`/marques/${brand.id}`} className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Tous les {brand.name}
      </Link>

      <div className="flex items-center gap-3 mb-3">
        <BrandBadge brand={brand} size={32} />
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em]">
          Gamme · {brand.name}
        </div>
      </div>
      <h1 className="font-display font-bold text-[32px] leading-tight mb-5">{gammeName}</h1>

      <div className="flex gap-8 flex-wrap mb-8">
        <Stat value={models.length} label={`Modèle${models.length > 1 ? 's' : ''}`} />
        <Stat
          value={first.id === last.id ? yearOf(first.release_date) : `${yearOf(first.release_date)} → ${yearOf(last.release_date)}`}
          label="Période"
        />
        {stats.avgPrice && <Stat value={`${stats.avgPrice} $`} label="Prix moyen" />}
      </div>

      <p className="text-dim text-[14.5px] max-w-[720px] mb-10 leading-relaxed">
        {isSingle ? (
          <>
            La gamme <b className="text-white">{gammeName}</b> ne compte pour l&apos;instant qu&apos;un seul modèle chez{' '}
            {brand.name} : <b className="text-white">{first.name}</b>, sorti en {yearOf(first.release_date)}
            {first.price ? ` à ${fmtMoney(first.price)}` : ''}.
          </>
        ) : (
          <>
            La gamme <b className="text-white">{gammeName}</b> compte {models.length} modèles chez {brand.name}, de{' '}
            <b className="text-white">{first.name}</b> ({yearOf(first.release_date)}) à{' '}
            <b className="text-white">{last.name}</b> ({yearOf(last.release_date)}).
            {gainedAnc && ' La réduction de bruit active a fait son apparition en cours de route.'}
            {battDelta !== null && Math.abs(battDelta) >= 10 && (
              <>
                {' '}
                L&apos;autonomie totale a évolué de {battDelta > 0 ? '+' : ''}
                {battDelta}% entre le premier et le dernier modèle.
              </>
            )}
            {priceDelta !== null && Math.abs(priceDelta) >= 10 && (
              <>
                {' '}
                Le prix de lancement a {priceDelta > 0 ? 'augmenté' : 'baissé'} de {Math.abs(priceDelta)}% sur la période.
              </>
            )}
          </>
        )}
      </p>

      {!isSingle && (
        <aside className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          <StatTile icon={BatteryCharging} value={`${stats.avgCaseH} h`} label="Autonomie moyenne" />
          <StatTile icon={Cpu} value={stats.commonBt || '—'} label="Bluetooth le plus courant" />
          {stats.avgPrice && <StatTile icon={DollarSign} value={`${stats.avgPrice} $`} label="Prix moyen" />}
        </aside>
      )}

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Chronologie</h2>
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
              <div className="w-14 h-14 rounded-lg bg-panel2 flex items-center justify-center overflow-hidden shrink-0">
                {m.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image_url} alt="" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <EarbudsIcon color={brand.color} className="w-8 h-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-medium text-[14.5px] truncate">{m.name}</p>
                <p className="m-0 text-dim text-xs mt-0.5">
                  {fmtDate(m.release_date)} · {fmtMoney(m.price)} · {m.anc ? 'ANC' : 'Sans ANC'}
                </p>
              </div>
              {m.marquant && <span className="text-amber text-xs shrink-0">★</span>}
            </Link>
          </div>
        ))}
      </div>

      {!isSingle && (
        <>
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Génération par génération</h2>
          <div className="flex flex-col gap-3 mb-12">
            {models.slice(1).map((cur, i) => {
              const prev = models[i];
              const bullets = buildDiffBullets(cur, prev);
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
                      Comparer →
                    </Link>
                  </div>
                  {bullets.length === 0 ? (
                    <p className="text-dim text-xs m-0">Peu de changements notables sur les caractéristiques suivies.</p>
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

      <RelatedArticles articles={relatedArticles} />

      <Footer />
    </>
  );
}
