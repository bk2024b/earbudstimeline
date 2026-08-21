import { Link } from '@/i18n/navigation';
import { ChevronRight, GitBranch, Shield, Bluetooth, Music2, Usb, Zap } from 'lucide-react';
import { slugify } from '@/lib/slug';

// Graphe d'entités du modèle courant : rend explicites et navigables en un
// coup d'œil toutes les relations qui existaient déjà dans la page mais
// dispersées en liens texte séparés (chaîne marque→gamme dans le fil
// d'ariane, prev/next dans TimelinePosition, techs dans chaque SpecLine).
// Ici : une seule carte, un seul graphe, chaque nœud clique vers son hub.
// C'est la version "navigable" du graphe marque→gamme→génération→techno —
// pas une infographie statique, chaque nœud est un vrai lien Next.js.

function Node({ href, eyebrow, label, active, icon: Icon, className = '' }) {
  const content = (
    <div
      className={`flex flex-col items-center text-center gap-1 rounded-xl border px-3.5 py-3 min-w-[92px] transition-colors ${
        active
          ? 'bg-accent/10 border-accent text-fg'
          : 'bg-panel2 border-line text-dim hover:border-accent hover:text-fg'
      } ${className}`}
    >
      {Icon && <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-accent' : ''}`} />}
      {eyebrow && <span className="text-[10px] uppercase tracking-wider opacity-70">{eyebrow}</span>}
      <span className="text-[12.5px] font-medium leading-tight truncate max-w-[140px]">{label}</span>
    </div>
  );
  if (!href || active) return content;
  return (
    <Link href={href} className="focus-visible:ring-2 focus-visible:ring-accent/60 rounded-xl">
      {content}
    </Link>
  );
}

export default function EntityGraph({ model: m, brand, prev, next, locale }) {
  const t = (en, fr) => (locale === 'en' ? en : fr);
  const gammeSlug = slugify(m.gamme);
  const firstCodec = m.codec && m.codec !== '—' ? m.codec.split(',')[0].trim() : null;

  const techNodes = [
    m.anc && { href: '/technologies/anc', label: 'ANC', icon: Shield },
    m.bluetooth && { href: `/technologies/bluetooth/${m.bluetooth}`, label: `Bluetooth ${m.bluetooth}`, icon: Bluetooth },
    firstCodec && { href: `/technologies/codecs/${slugify(firstCodec)}`, label: firstCodec, icon: Music2 },
    m.usb_c && { href: '/technologies/usb-c', label: 'USB-C', icon: Usb },
    m.multipoint && { href: '/technologies/multipoint', label: t('Multipoint', 'Multipoint'), icon: Zap },
  ].filter(Boolean);

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 mb-12">
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-4 h-4 text-accent" />
        <h2 className="text-[15px] m-0">{t('Entity graph', "Graphe d'entités")}</h2>
      </div>

      {/* Chaîne de filiation : marque → gamme → modèle courant */}
      <div className="flex items-center gap-2 flex-wrap mb-6 text-[13px]">
        <Link href={`/marques/${m.brand_id}`} className="px-3 py-1.5 rounded-full border border-line text-dim hover:border-accent hover:text-fg transition-colors">
          {brand?.name || m.brand_id}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim shrink-0" />
        <Link href={`/marques/${m.brand_id}/${gammeSlug}`} className="px-3 py-1.5 rounded-full border border-line text-dim hover:border-accent hover:text-fg transition-colors">
          {m.gamme}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-dim shrink-0" />
        <span className="px-3 py-1.5 rounded-full border border-accent bg-accent/10 text-fg font-medium">{m.name}</span>
      </div>

      {/* Hub génération : précédent ↔ modèle courant ↔ suivant, sur une ligne de connexion */}
      <div className="relative mb-6">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-line -z-0" aria-hidden="true" />
        <div className="relative flex items-stretch justify-center gap-3 sm:gap-6 flex-wrap">
          <Node
            href={prev ? `/ecouteurs/${prev.id}` : undefined}
            eyebrow={t('Previous gen.', 'Génération préc.')}
            label={prev ? prev.name : '—'}
            className={!prev ? 'opacity-40' : ''}
          />
          <Node label={m.name} eyebrow={t('You are here', 'Vous êtes ici')} active />
          <Node
            href={next ? `/ecouteurs/${next.id}` : undefined}
            eyebrow={t('Next gen.', 'Génération suiv.')}
            label={next ? next.name : '—'}
            className={!next ? 'opacity-40' : ''}
          />
        </div>
      </div>

      {/* Branches techno : chaque caractéristique clé du modèle, reliée à son hub */}
      {techNodes.length > 0 && (
        <div className="border-t border-line pt-4">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {techNodes.map((node) => (
              <Node key={node.href} href={node.href} label={node.label} icon={node.icon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
