import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEarbudBySlug, getGammeModels, getBrands, getAllEarbuds } from '@/lib/queries';
import { fmtDate, fmtH, fmtG, fmtMoney, yearOf, pct } from '@/lib/format';
import QuickCompareSelect from '@/components/QuickCompareSelect';
import { Badge, Footer } from '@/components/UI';

export const revalidate = 3600;

export default async function ModelPage({ params }) {
  const m = await getEarbudBySlug(params.slug).catch(() => null);
  if (!m) notFound();

  const [lineup, brands, allModels] = await Promise.all([
    getGammeModels(m.brand_id, m.gamme),
    getBrands(),
    getAllEarbuds(),
  ]);

  const brand = brands.find((b) => b.id === m.brand_id);
  const first = lineup[0];
  const isFirst = first.id === m.id;

  function metric(label, key, higherIsBetter, fmt) {
    const cur = Number(m[key]);
    const base = Number(first[key]);
    const values = lineup.map((x) => Number(x[key]));
    const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
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
              {d}% depuis le 1er modèle
            </span>
          )}
          {isRecord && (
            <span className="text-xs px-1.5 py-0.5 rounded text-accent bg-accent/15">★ record de la gamme</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Link
        href={`/marques/${m.brand_id}`}
        className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent"
      >
        ← Tous les {brand?.name || m.brand_id}
      </Link>
      <div className="font-mono text-xs text-dim mb-2.5">
        🎧 {brand?.name || m.brand_id} · {m.gamme}
      </div>
      <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] mb-2.5">{m.name}</h1>
      <p className="text-accent text-[15px] mb-7">{m.tagline}</p>

      <div className="flex gap-2 flex-wrap mb-8">
        <Badge>{fmtDate(m.release_date)}</Badge>
        {m.marquant && <Badge gold>★ Modèle marquant</Badge>}
        <Badge>{fmtMoney(m.price)} au lancement</Badge>
        <Badge>{m.anc ? 'Réduction de bruit active' : 'Sans ANC'}</Badge>
        <Badge>{m.water_rating}</Badge>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-px bg-line border border-line rounded-xl overflow-hidden mb-12">
        <KeySpec value={fmtH(m.battery_bud_h)} label="Écouteur seul" />
        <KeySpec value={fmtH(m.battery_case_h)} label="Avec boîtier" />
        <KeySpec value={fmtG(m.weight_g)} label="Poids / écouteur" />
        <KeySpec value={m.bluetooth} label="Bluetooth" />
      </div>

      <div className="bg-panel border border-line rounded-2xl px-5 pt-5 pb-1 mb-12">
        <h2 className="text-[15px] m-0 mb-1">ADN de la gamme</h2>
        <p className="text-dim text-xs m-0 mb-4">
          {isFirst
            ? `Premier modèle de la gamme ${m.gamme} — sert de référence pour les générations suivantes.`
            : `Suivi depuis ${first.name} (${yearOf(first.release_date)}), premier modèle de la gamme.`}
        </p>
        {lineup.length === 1 ? (
          <p className="text-dim text-[13.5px] py-4">
            Seul modèle de cette gamme pour le moment — aucune comparaison possible.
          </p>
        ) : (
          <>
            {metric('Autonomie écouteur', 'battery_bud_h', true, fmtH)}
            {metric('Autonomie totale (boîtier)', 'battery_case_h', true, fmtH)}
            {metric('Poids par écouteur', 'weight_g', false, fmtG)}
            {metric('Prix au lancement', 'price', false, fmtMoney)}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        <SpecGroup title="Audio">
          <SpecLine k="Puce" v={m.chip} />
          <SpecLine k="Réduction de bruit" v={m.anc ? 'Oui' : 'Non'} />
          <SpecLine k="Bluetooth" v={m.bluetooth} />
        </SpecGroup>
        <SpecGroup title="Confort & résistance">
          <SpecLine k="Poids par écouteur" v={fmtG(m.weight_g)} />
          <SpecLine k="Certification" v={m.water_rating} />
        </SpecGroup>
        <SpecGroup title="Autonomie">
          <SpecLine k="Écouteur seul" v={fmtH(m.battery_bud_h)} />
          <SpecLine k="Avec boîtier" v={fmtH(m.battery_case_h)} />
        </SpecGroup>
        <SpecGroup title="Général">
          <SpecLine k="Date de sortie" v={fmtDate(m.release_date)} />
          <SpecLine k="Prix au lancement" v={fmtMoney(m.price)} />
        </SpecGroup>
      </div>

      <div className="bg-panel border border-dashed border-line rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap mb-5">
        <p className="m-0 text-[13.5px] text-dim">Vous possédez déjà des écouteurs ? Comparez-les à ceux-ci.</p>
        <QuickCompareSelect currentId={m.id} brands={brands} allModels={allModels} />
      </div>
      <Footer />
    </>
  );
}

function KeySpec({ value, label }) {
  return (
    <div className="bg-panel px-4 py-4.5">
      <b className="block font-display text-xl mb-0.5">{value}</b>
      <span className="text-dim text-[11.5px] uppercase tracking-[0.06em]">{label}</span>
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

function SpecLine({ k, v }) {
  return (
    <div className="flex justify-between py-2.5 border-t border-line text-[13.5px]">
      <span className="text-dim">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
