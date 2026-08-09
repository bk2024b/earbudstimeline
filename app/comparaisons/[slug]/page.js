import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { fmtH, fmtG, fmtMoney, yearOf } from '@/lib/format';
import { parseComparisonSlug, buildComparisonSlug, isCanonicalSlug } from '@/lib/compareSlug';
import { buildBreadcrumbJsonLd, absoluteUrl, JsonLd } from '@/lib/seo';
import EarbudsIcon from '@/components/EarbudsIcon';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

async function loadPair(slug) {
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return { a: null, b: null, brands: [] };

  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const a = models.find((m) => m.id === parsed[0]);
  const b = models.find((m) => m.id === parsed[1]);
  return { a, b, brands };
}

export async function generateMetadata({ params }) {
  const { a, b, brands } = await loadPair(params.slug);
  if (!a || !b) return { title: 'Comparaison introuvable — EarbudsTimeline' };

  const brandName = (id) => brands.find((br) => br.id === id)?.name || id;

  return {
    title: `${a.name} vs ${b.name} — Comparatif complet | EarbudsTimeline`,
    description: `${a.name} (${brandName(a.brand_id)}) contre ${b.name} (${brandName(b.brand_id)}) : autonomie, réduction de bruit, poids, prix, USB-C, multipoint et codecs comparés en détail.`,
    openGraph: {
      title: `${a.name} vs ${b.name}`,
      description: `Comparatif complet entre le ${a.name} et le ${b.name}.`,
    },
  };
}

export default async function ComparisonPage({ params }) {
  const { slug } = params;
  const { a, b, brands } = await loadPair(slug);
  if (!a || !b) notFound();

  if (!isCanonicalSlug(slug)) {
    redirect(`/comparaisons/${buildComparisonSlug(a.id, b.id)}`);
  }

  const brandOf = (id) => brands.find((br) => br.id === id);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: 'Comparaisons', url: '/comparaisons' },
          { name: `${a.name} vs ${b.name}`, url: `/comparaisons/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${a.name} vs ${b.name}`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, url: absoluteUrl(`/ecouteurs/${a.id}`), name: a.name },
            { '@type': 'ListItem', position: 2, url: absoluteUrl(`/ecouteurs/${b.id}`), name: b.name },
          ],
        }}
      />

      <Link href="/comparaisons" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Toutes les comparaisons
      </Link>

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Comparatif</div>
      <h1 className="font-display font-bold text-[28px] sm:text-[32px] mb-6 leading-tight">
        {a.name} <span className="text-dim font-normal">vs</span> {b.name}
      </h1>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Head m={a} brand={brandOf(a.brand_id)} />
        <Head m={b} brand={brandOf(b.brand_id)} />
        <span className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-ink border border-line text-dim text-[11px] font-mono">
          VS
        </span>
      </div>

      <div className="bg-panel border border-line rounded-2xl px-5 mb-6">
        <Row label="Autonomie écouteur" a={a.battery_bud_h} b={b.battery_bud_h} higher fmt={fmtH} />
        <Row label="Autonomie totale" a={a.battery_case_h} b={b.battery_case_h} higher fmt={fmtH} />
        <Row label="Poids / écouteur" a={a.weight_g} b={b.weight_g} fmt={fmtG} />
        <Row label="Prix au lancement" a={a.price} b={b.price} fmt={fmtMoney} />
        <RawRow label="Réduction de bruit" a={a.anc ? 'Oui' : 'Non'} b={b.anc ? 'Oui' : 'Non'} />
        <RawRow label="Certification" a={a.water_rating} b={b.water_rating} />
        <RawRow label="Bluetooth" a={a.bluetooth} b={b.bluetooth} />
        <RawRow label="USB-C" a={a.usb_c ? 'Oui' : 'Non'} b={b.usb_c ? 'Oui' : 'Non'} />
        <RawRow label="Multipoint" a={a.multipoint ? 'Oui' : 'Non'} b={b.multipoint ? 'Oui' : 'Non'} />
        <RawRow label="Codecs" a={a.codec} b={b.codec} last />
      </div>

      <Link
        href={`/comparer?a=${a.id}&b=${b.id}`}
        className="inline-block text-accent text-xs hover:underline mb-8"
      >
        Modifier cette comparaison →
      </Link>

      <Footer />
    </>
  );
}

function Head({ m, brand }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-4 flex items-center gap-3.5">
      <div className="bg-panel2 rounded-xl w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden">
        {m.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.image_url} alt="" className="w-full h-full object-contain p-1.5" />
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
