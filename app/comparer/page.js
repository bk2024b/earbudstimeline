import { getAllEarbuds, getBrands } from '@/lib/queries';
import { fmtH, fmtG, fmtMoney, yearOf } from '@/lib/format';
import CompareSelectors from '@/components/CompareSelectors';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export default async function ComparePage({ searchParams }) {
  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const a = models.find((m) => m.id === searchParams.a);
  const b = models.find((m) => m.id === searchParams.b);
  const brandName = (id) => brands.find((br) => br.id === id)?.name || id;

  return (
    <>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Comparateur</div>
      <h1 className="font-display font-bold text-[32px] mb-5">Comparer deux écouteurs</h1>

      <CompareSelectors brands={brands} models={models} a={searchParams.a} b={searchParams.b} />

      {!a || !b ? (
        <div className="text-dim text-[13.5px] py-8 text-center">
          Choisissez deux modèles ci-dessus pour lancer la comparaison.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1.5">
            <Head m={a} brandName={brandName(a.brand_id)} />
            <Head m={b} brandName={brandName(b.brand_id)} />
          </div>
          <Row label="Autonomie écouteur" a={a.battery_bud_h} b={b.battery_bud_h} higher fmt={fmtH} />
          <Row label="Autonomie totale" a={a.battery_case_h} b={b.battery_case_h} higher fmt={fmtH} />
          <Row label="Poids / écouteur" a={a.weight_g} b={b.weight_g} fmt={fmtG} />
          <Row label="Prix au lancement" a={a.price} b={b.price} fmt={fmtMoney} />
          <RawRow label="Réduction de bruit" a={a.anc ? 'Oui' : 'Non'} b={b.anc ? 'Oui' : 'Non'} />
          <RawRow label="Certification" a={a.water_rating} b={b.water_rating} />
          <RawRow label="Bluetooth" a={a.bluetooth} b={b.bluetooth} />
        </>
      )}
      <Footer />
    </>
  );
}

function Head({ m, brandName }) {
  return (
    <div className="bg-panel border border-line rounded-xl p-4.5">
      <h3 className="m-0 mb-1 text-base">🎧 {m.name}</h3>
      <p className="m-0 text-dim text-xs">
        {brandName} · {yearOf(m.release_date)}
      </p>
    </div>
  );
}

function Row({ label, a, b, fmt, higher }) {
  const na = Number(a);
  const nb = Number(b);
  const aWins = higher ? na > nb : na < nb;
  const bWins = higher ? nb > na : nb < na;
  return (
    <div className="grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] gap-2 py-2.5 border-t border-line items-center text-[13.5px]">
      <div className="text-dim text-xs">{label}</div>
      <div className={`font-mono px-2 py-1 rounded ${aWins ? 'bg-accent/15 text-accent' : ''}`}>{fmt(a)}</div>
      <div className={`font-mono px-2 py-1 rounded ${bWins ? 'bg-accent/15 text-accent' : ''}`}>{fmt(b)}</div>
    </div>
  );
}

function RawRow({ label, a, b }) {
  return (
    <div className="grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] gap-2 py-2.5 border-t border-line items-center text-[13.5px]">
      <div className="text-dim text-xs">{label}</div>
      <div className="font-mono px-2 py-1 rounded">{a}</div>
      <div className="font-mono px-2 py-1 rounded">{b}</div>
    </div>
  );
}
