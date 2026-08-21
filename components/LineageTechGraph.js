import { Link } from '@/i18n/navigation';
import { ChevronRight, GitBranch, Shield, Bluetooth, Music2, Usb, Zap } from 'lucide-react';
import { slugify } from '@/lib/slug';

// Variante de EntityGraph pour une page GAMME (plusieurs modèles, pas un
// seul) : la chronologie verticale existe déjà plus bas sur la page, donc ce
// composant n'y repasse pas — il ajoute la couche qui manquait, celle des
// technos, agrégée sur toute la lignée et pas juste listée modèle par
// modèle. "Cette gamme a eu du Bluetooth 5.0 puis 5.3" en un coup d'œil,
// chaque valeur cliquant vers son hub technologique.

function Chip({ href, label, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'accent'
      ? 'bg-accent/10 border-accent text-fg'
      : 'bg-panel2 border-line text-dim hover:border-accent hover:text-fg';
  const content = (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${toneClass}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {label}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} className="focus-visible:ring-2 focus-visible:ring-accent/60 rounded-full">
      {content}
    </Link>
  );
}

export default function LineageTechGraph({ brand, brandId, gammeName, gammeSlug, models, locale }) {
  const t = (en, fr) => (locale === 'en' ? en : fr);

  const hasAnc = models.some((m) => m.anc);
  const hasUsbC = models.some((m) => m.usb_c);
  const hasMultipoint = models.some((m) => m.multipoint);
  const btVersions = [...new Set(models.map((m) => m.bluetooth).filter(Boolean))].sort();
  const codecs = [...new Set(models.map((m) => (m.codec && m.codec !== '—' ? m.codec.split(',')[0].trim() : null)).filter(Boolean))];

  const techChips = [
    hasAnc && { href: '/technologies/anc', label: 'ANC', icon: Shield },
    ...btVersions.map((v) => ({ href: `/technologies/bluetooth/${v}`, label: `Bluetooth ${v}`, icon: Bluetooth })),
    ...codecs.map((c) => ({ href: `/technologies/codecs/${slugify(c)}`, label: c, icon: Music2 })),
    hasUsbC && { href: '/technologies/usb-c', label: 'USB-C', icon: Usb },
    hasMultipoint && { href: '/technologies/multipoint', label: t('Multipoint', 'Multipoint'), icon: Zap },
  ].filter(Boolean);

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 mb-12">
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-4 h-4 text-accent" />
        <h2 className="text-[15px] m-0">{t('Entity graph', "Graphe d'entités")}</h2>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-5 text-[13px]">
        <Link href={`/marques/${brandId}`} className="px-3 py-1.5 rounded-full border border-line text-dim hover:border-accent hover:text-fg transition-colors">
          {brand?.name || brandId}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim shrink-0" />
        <span className="px-3 py-1.5 rounded-full border border-accent bg-accent/10 text-fg font-medium">{gammeName}</span>
      </div>

      {techChips.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="text-[11px] uppercase tracking-wider text-dim mb-3">
            {t('Technologies across the line', 'Technologies présentes sur toute la lignée')}
          </p>
          <div className="flex flex-wrap gap-2">
            {techChips.map((c) => (
              <Chip key={c.href} href={c.href} label={c.label} icon={c.icon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
