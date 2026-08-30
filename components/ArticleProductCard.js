import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, ExternalLink, ArrowRight, ShieldCheck, Battery, Weight } from 'lucide-react';
import EarbudsIcon from '@/components/EarbudsIcon';
import { fmtMoney, fmtH, fmtG } from '@/lib/format';

export default function ArticleProductCard({ model, brand, locale = 'fr' }) {
  if (!model) return null;

  const isEn = locale === 'en';

  return (
    <div className="my-8 rounded-base border border-line bg-panel p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-accent/50 hover:shadow-glow transition-all">
      {/* Halo lumineux subtil */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Vignette produit */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-panel2 border border-line flex items-center justify-center shrink-0 overflow-hidden">
          {model.image_url ? (
            <Image
              src={model.image_url}
              alt={model.name}
              fill
              sizes="96px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <EarbudsIcon color={brand?.color || '#9A9AA3'} className="w-12 h-12 opacity-60" />
          )}
        </div>

        {/* Détails produit */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-medium">
              {brand?.name || model.brand_id}
            </span>
            {model.price && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                {fmtMoney(model.price)}
              </span>
            )}
          </div>

          <h4 className="font-display font-bold text-lg text-fg m-0 leading-snug">
            {model.name}
          </h4>

          {/* Badges specs clés */}
          <div className="flex items-center gap-3 flex-wrap mt-2.5 text-xs text-dim">
            {model.anc && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ANC</span>
              </span>
            )}
            {model.battery_bud_h && (
              <span className="flex items-center gap-1 bg-panel2 px-2 py-0.5 rounded-md border border-line">
                <Battery className="w-3.5 h-3.5 text-accent" />
                <span>{fmtH(model.battery_bud_h)}</span>
              </span>
            )}
            {model.weight_g && (
              <span className="flex items-center gap-1 bg-panel2 px-2 py-0.5 rounded-md border border-line">
                <Weight className="w-3.5 h-3.5 text-dim" />
                <span>{fmtG(model.weight_g)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
          {model.buy_url && (
            <a
              href={model.buy_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full sm:w-auto bg-accent text-ink font-bold rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-accent/20 shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isEn ? 'Buy / Offer' : "Voir l'offre"}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
          <Link
            href={`/ecouteurs/${model.id}`}
            className="w-full sm:w-auto border border-line hover:border-accent text-dim hover:text-fg rounded-xl px-3.5 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors bg-panel2/50 shrink-0"
          >
            <span>{isEn ? 'Full Specs' : 'Fiche complète'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
