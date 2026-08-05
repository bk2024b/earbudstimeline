import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Battery, BatteryFull, Droplet, Bluetooth } from 'lucide-react';
import { getEarbudBySlug, getGammeModels, getBrands, getAllEarbuds } from '@/lib/queries';
import { fmtDate, fmtH, fmtG, fmtMoney, yearOf, pct } from '@/lib/format';
import QuickCompareSelect from '@/components/QuickCompareSelect';
import EarbudsIcon from '@/components/EarbudsIcon';
import TimelinePosition from '@/components/TimelinePosition';
import { Badge, Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

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
  const idx = lineup.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? lineup[idx - 1] : null;
  const next = idx < lineup.length - 1 ? lineup[idx + 1] : null;

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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <Link
          href={`/marques/${m.brand_id}`}
          className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent"
        >
          ← Tous les {brand?.name || m.brand_id}
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 mb-8">
          <div className="bg-panel2 border border-line rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            {m.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image_url} alt={m.name} className="w-full h-full object-contain" />
            ) : (
              <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-20 h-20" />
            )}
          </div>
          <div>
            <div className="font-mono text-xs text-dim mb-2">
              {brand?.name || m.brand_id} · {m.gamme}
            </div>
            <h1 className="font-display font-bold text-[clamp(24px,3.4vw,34px)] mb-2 leading-tight">{m.name}</h1>
            <p className="text-accent text-[15px] mb-5">{m.tagline}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge>{fmtDate(m.release_date)}</Badge>
              {m.marquant && <Badge gold>★ Modèle marquant</Badge>}
              <Badge>{fmtMoney(m.price)} au lancement</Badge>
              <Badge>{m.anc ? 'Réduction de bruit active' : 'Sans ANC'}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-xl overflow-hidden mb-12">
          <KeySpec icon={Battery} value={fmtH(m.battery_bud_h)} label="Écouteur seul" />
          <KeySpec icon={BatteryFull} value={fmtH(m.battery_case_h)} label="Avec boîtier" />
          <KeySpec icon={Droplet} value={m.water_rating} label="Résistance" />
          <KeySpec icon={Bluetooth} value={m.bluetooth} label="Bluetooth" />
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
      </div>

      <aside className="flex flex-col gap-5">
        {(prev || next) && <TimelinePosition prev={prev} current={m} next={next} gammeName={m.gamme} />}
      </aside>

      <div className="lg:col-span-2">
        <Footer />
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

function SpecLine({ k, v }) {
  return (
    <div className="flex justify-between py-2.5 border-t border-line text-[13.5px]">
      <span className="text-dim">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
