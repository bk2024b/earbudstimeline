import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { yearOf, fmtH, fmtG } from '@/lib/format';
import EarbudsIcon from './EarbudsIcon';

export default async function ModelCard({ m, color, locale }) {
  const t = await getTranslations({ locale, namespace: 'modelCard' });

  return (
    <Link
      href={`/ecouteurs/${m.id}`}
      className="hardware-card group block bg-panel p-4"
    >
      <div className="relative w-full aspect-[4/3] rounded-base bg-panel2 flex items-center justify-center mb-3 overflow-hidden p-2">
        {m.image_url ? (
          <Image
            src={m.image_url}
            alt={m.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-contain p-2 floating-hardware"
          />
        ) : (
          <EarbudsIcon color={color || '#9A9AA3'} className="w-14 h-14" />
        )}
      </div>
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className="m-0 font-display text-[14px] font-bold leading-tight group-hover:text-accent transition-colors text-fg truncate">
          {m.name}
        </h3>
        <span className="font-mono text-[11px] text-accent font-semibold whitespace-nowrap">
          {yearOf(m.release_date)}
        </span>
      </div>
      <div className="text-[11.5px] text-dim mb-2.5 truncate">
        {m.gamme}
        {m.marquant && (
          <>
            {' '}
            · <span className="text-amber">★</span>
          </>
        )}
      </div>
      <div className="flex gap-3 font-mono text-[11px] text-dim flex-wrap pt-2 border-t border-line/50">
        <span>
          {t('case')} <b className="text-fg font-semibold">{fmtH(m.battery_case_h)}</b>
        </span>
        <span>
          {t('weight')} <b className="text-fg font-semibold">{fmtG(m.weight_g)}</b>
        </span>
      </div>
    </Link>
  );
}
