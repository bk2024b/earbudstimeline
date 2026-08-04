import { getAllEarbuds, getBrands } from '@/lib/queries';
import { fmtH, fmtG, fmtMoney, yearOf } from '@/lib/format';
import CompareSelectors from '@/components/CompareSelectors';
import EarbudsIcon from '@/components/EarbudsIcon';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export default async function ComparePage({ searchParams }) {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const a = models.find((m) => m.id === searchParams.a);
  const b = models.find((m) => m.id === searchParams.b);
  const brandOf = (id) => brands.find((br) => br.id === id);

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Comparateur</div>
      <h1 className="font-display font-bold text-[32px] mb-6">Comparer deux écouteurs</h1>

      <CompareSelectors brands={brands} models={models} a={searchParams.a} b={searchParams.b} />

      {!a || !b ? (
        <div className="bg-panel border border-dashed border-line rounded-2xl text-dim text-[13.5px] py-14 text-center">
          Choisissez deux modèles ci-dessus pour lancer la comparaison.
        </div>
      ) : (
        <>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Head m={a} brand={brandOf(a.brand_id)} />
            <Head m={b} brand={brandOf(b.brand_id)} />
            <span className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-ink border border-line text-dim text-[11px] font-mono">
              VS
            </span>
          </div>

          <div className="bg-panel border border-line rounded-2xl px-5">
            <Row label="Autonomie écouteur" a={a.battery_bud_h} b={b.battery_bud_h} higher fmt={fmtH} />
            <Row label="Autonomie totale" a={a.battery_case_h} b={b.battery_case_h} higher fmt={fmtH} />
            <Row label="Poids / écouteur" a={a.weight_g} b={b.weight_g} fmt={fmtG} />
            <Row label="Prix au lancement" a={a.price} b={b.price} fmt={fmtMoney} />
            <RawRow label="Réduction de bruit" a={a.anc ? 'Oui' : 'Non'} b={b.anc ? 'Oui' : 'Non'} />
            <RawRow label="Certification" a={a.water_rating} b={b.water_rating} last />
            <RawRow label="Bluetooth" a={a.bluetooth} b={b.bluetooth} last />
          </div>
        </>
      )}
      <Footer />
    </>
  );
}

function Head({ m, brand }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-4 flex items-center gap-3.5">
      <div className="bg-panel2 rounded-xl w-14 h-14 flex items-center justify-center shrink-0">
        <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-9 h-9" />
      </div>
      <div>
        <h3 className="m-0 mb-0.5 text-[15px] leading-tight">{m.name}</h3>
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
