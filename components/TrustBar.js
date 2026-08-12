import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Zap, Search, Heart } from 'lucide-react';

export default async function TrustBar({ locale }) {
  const t = await getTranslations({ locale, namespace: 'trust' });

  const items = [
    { icon: ShieldCheck, title: t('reliableTitle'), desc: t('reliableDesc') },
    { icon: Zap, title: t('freshTitle'), desc: t('freshDesc') },
    { icon: Search, title: t('searchTitle'), desc: t('searchDesc') },
    { icon: Heart, title: t('independentTitle'), desc: t('independentDesc') },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Icon size={17} />
          </span>
          <div>
            <p className="m-0 text-[13.5px] font-medium">{title}</p>
            <p className="m-0 text-dim text-xs mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
