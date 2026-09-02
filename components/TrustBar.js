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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="hardware-card bg-panel p-4 flex items-start gap-3.5">
          <span className="w-9 h-9 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={17} />
          </span>
          <div>
            <p className="m-0 text-sm font-semibold text-fg">{title}</p>
            <p className="m-0 text-dim text-xs mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
