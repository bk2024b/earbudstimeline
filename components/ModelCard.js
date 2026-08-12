import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { yearOf, fmtH, fmtG } from '@/lib/format';
import EarbudsIcon from './EarbudsIcon';

export default async function ModelCard({ m, color, locale }) {
  const t = await getTranslations({ locale, namespace: 'modelCard' });

  return (
    <Link
      href={`/ecouteurs/${m.id}`}
      className="block bg-panel border border-line rounded-xl p-4 hover:border-accent hover:-translate-y-0.5 transition-all"
    >
      <div className="w-full aspect-[4/3] rounded-lg bg-panel2 flex items-center justify-center mb-3 overflow-hidden">
        {m.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.image_url} alt={m.name} className="w-full h-full object-contain" />
        ) : (
          <EarbudsIcon color={color || '#9A9AA3'} className="w-14 h-14" />
        )}
      </div>
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h4 className="m-0 text-[14px] font-semibold leading-tight">{m.name}</h4>
        <span className="font-mono text-[11px] text-dim whitespace-nowrap">{yearOf(m.release_date)}</span>
      </div>
      <div className="text-[11.5px] text-dim mb-2.5">
        {m.gamme}
        {m.marquant && (
          <>
            {' '}
            · <span className="text-amber">★</span>
          </>
        )}
      </div>
      <div className="flex gap-3 font-mono text-[11px] text-dim flex-wrap">
        <span>
          {t('case')} <b className="text-white font-semibold">{fmtH(m.battery_case_h)}</b>
        </span>
        <span>
          {t('weight')} <b className="text-white font-semibold">{fmtG(m.weight_g)}</b>
        </span>
      </div>
    </Link>
  );
}
