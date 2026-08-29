'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  DollarSign,
  Battery,
  Shield,
  Volume2,
  Activity,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Swords,
  ExternalLink,
  Zap,
  Share2,
  Check,
  ShoppingCart,
} from 'lucide-react';
import { analyzeEarbudsForBudget } from '@/lib/timelineIntelligence';
import { buildComparisonSlug } from '@/lib/compareSlug';
import { slugify } from '@/lib/slug';

const BUDGET_PRESETS = [99, 149, 199, 249, 299, 500];

export default function TimelineIntelligenceFinder({ initialModels = [], initialBrands = [], initialAncScores = [] }) {
  const locale = useLocale();
  const t = useTranslations('intelligence');
  const common = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialisation depuis l'URL si des paramètres existent
  const initialBudgetParam = searchParams.get('budget');
  const initialPriorityParam = searchParams.get('priority');
  const initialBrandParam = searchParams.get('brand');

  const [maxBudget, setMaxBudget] = useState(
    initialBudgetParam ? Number(initialBudgetParam) : 200
  );
  const [priority, setPriority] = useState(initialPriorityParam || 'balanced');
  const [selectedBrand, setSelectedBrand] = useState(initialBrandParam || 'all');
  const [copied, setCopied] = useState(false);

  // Synchronisation de l'URL avec les filtres
  useEffect(() => {
    const params = new URLSearchParams();
    if (maxBudget !== 200) params.set('budget', maxBudget.toString());
    if (priority !== 'balanced') params.set('priority', priority);
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);

    const queryString = params.toString();
    const newPath = queryString ? `/${locale}/trouver-mes-ecouteurs?${queryString}` : `/${locale}/trouver-mes-ecouteurs`;
    window.history.replaceState(null, '', newPath);
  }, [maxBudget, priority, selectedBrand, locale]);

  function handleCopyLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const analysis = useMemo(() => {
    return analyzeEarbudsForBudget(initialModels, initialBrands, {
      maxBudget,
      priority,
      brandId: selectedBrand,
      locale,
      ancScores: initialAncScores,
    });
  }, [initialModels, initialBrands, initialAncScores, maxBudget, priority, selectedBrand, locale]);

  const { winner, alternatives, totalUnderBudget } = analysis;

  const priorities = [
    { id: 'balanced', label: t('priorities.balanced'), icon: Sparkles },
    { id: 'anc', label: t('priorities.anc'), icon: Volume2 },
    { id: 'battery', label: t('priorities.battery'), icon: Battery },
    { id: 'sport', label: t('priorities.sport'), icon: Activity },
    { id: 'commute', label: t('priorities.commute'), icon: Zap },
    { id: 'value', label: t('priorities.value'), icon: DollarSign },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Panneau de contrôle / Filtres intelligents */}
      <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-fg">{t('controlTitle')}</h2>
              <p className="text-xs text-dim">{t('controlSubtitle')}</p>
            </div>
          </div>

          {/* Bouton Partager la recherche */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs bg-panel2 hover:bg-panel2/80 border border-line text-dim hover:text-fg rounded-xl px-3.5 py-2 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Lien copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-accent" />
                <span>Partager ce résultat</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Curseur Budget */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-dim">
                {t('budgetLabel')}
              </label>
              <div className="font-display text-2xl font-bold text-accent">
                {maxBudget >= 500 ? t('unlimitedBudget') : `${maxBudget} $`}
              </div>
            </div>

            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full h-2 bg-panel2 rounded-lg appearance-none cursor-pointer accent-accent mb-4"
            />

            {/* Boutons Presets */}
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMaxBudget(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    maxBudget === preset
                      ? 'bg-accent text-ink border-accent font-semibold'
                      : 'bg-panel2 border-line text-dim hover:text-fg hover:border-dim/50'
                  }`}
                >
                  {preset >= 500 ? t('all') : `≤ ${preset} $`}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre Écosystème / Marque */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-dim block mb-3">
              {t('ecosystemLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`text-xs px-3.5 py-2 rounded-lg border transition-colors ${
                  selectedBrand === 'all'
                    ? 'bg-white text-ink font-semibold border-white'
                    : 'bg-panel2 border-line text-dim hover:text-fg'
                }`}
              >
                {t('allBrands')}
              </button>
              {initialBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrand(b.id)}
                  style={{
                    borderColor: selectedBrand === b.id ? b.color : undefined,
                    backgroundColor: selectedBrand === b.id ? `${b.color}22` : undefined,
                    color: selectedBrand === b.id ? (b.color === '#F0F2F5' ? '#FFFFFF' : b.color) : undefined,
                  }}
                  className={`text-xs px-3.5 py-2 rounded-lg border transition-colors ${
                    selectedBrand === b.id
                      ? 'font-semibold border-current shadow-sm'
                      : 'bg-panel2 border-line text-dim hover:text-fg'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sélecteur de Priorité / Usage */}
        <div className="mt-8 pt-6 border-t border-line/60">
          <label className="text-xs font-semibold uppercase tracking-wider text-dim block mb-3">
            {t('priorityLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {priorities.map((item) => {
              const Icon = item.icon;
              const isSelected = priority === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPriority(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-accent/15 border-accent text-fg shadow-md shadow-accent/10'
                      : 'bg-panel2 border-line text-dim hover:text-fg hover:border-line2'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-accent' : 'text-dim'}`} />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Résultat : #1 Recommandation Timeline Intelligence */}
      {winner ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-accent uppercase tracking-wider bg-accent/10 border border-accent/30 rounded-full px-3 py-1">
                {t('verdictBadge')}
              </span>
              <span className="text-xs text-dim">
                {totalUnderBudget} {t('modelsAnalyzed')}
              </span>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border p-6 sm:p-9 transition-all shadow-2xl"
            style={{
              borderColor: `${winner.brand.color}55`,
              background: `linear-gradient(135deg, ${winner.brand.color}15 0%, rgba(18, 20, 29, 0.95) 45%, rgba(13, 15, 22, 1) 100%)`,
            }}
          >
            {/* Ruban Top Recommandation */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: winner.brand.color, color: '#0B0C10' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>#1 — {t('topRecommendation')}</span>
              </div>
              <span className="text-xs text-dim">
                Score Timeline : <b className="text-fg">{winner.score}/100</b>
              </span>
            </div>

            {/* En-tête Modèle */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold text-dim mb-1">
                  {winner.brand.name} • {winner.model.gamme}
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-fg">
                  {winner.model.name}
                </h3>
                <p className="text-sm text-dim italic mt-1">&laquo; {winner.model.tagline} &raquo;</p>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-line pt-3 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-bold text-fg">
                  {winner.model.price ? `${winner.model.price} $` : '—'}
                </div>
                <div className="text-xs text-dim">
                  {winner.model.release_date?.slice(0, 4)} • Lancement
                </div>
              </div>
            </div>

            {/* Grille des caractéristiques clés */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="bg-panel/70 border border-line rounded-xl p-3.5">
                <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">ANC</span>
                {winner.metrics.ancHasEvidence ? (
                  <>
                    <span className="font-semibold text-sm text-fg">{winner.metrics.ancScore}/100</span>
                    <span className="block text-[10px] text-dim mt-0.5">
                      {locale === 'en' ? 'evidence-based' : 'fondé sur preuves'} · {winner.metrics.ancCoverage}%
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-sm text-fg">
                    {winner.model.anc ? `✅ ${t('ancActive')}` : `❌ ${t('ancNone')}`}
                  </span>
                )}
              </div>

              <div className="bg-panel/70 border border-line rounded-xl p-3.5">
                <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">Autonomie</span>
                <span className="font-semibold text-sm text-fg">
                  {winner.model.battery_bud_h}h <span className="text-dim text-xs">/ {winner.metrics.totalBattery}h total</span>
                </span>
              </div>

              <div className="bg-panel/70 border border-line rounded-xl p-3.5">
                <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">Poids & Étanchéité</span>
                <span className="font-semibold text-sm text-fg">
                  {winner.model.weight_g}g • {winner.model.water_rating || 'IPX4'}
                </span>
              </div>

              <div className="bg-panel/70 border border-line rounded-xl p-3.5">
                <span className="text-[11px] uppercase tracking-wider text-dim block mb-1">Puce / BT</span>
                <span className="font-semibold text-sm text-fg truncate block">
                  BT {winner.model.bluetooth || '5.3'} {winner.model.chip !== '—' ? `• ${winner.model.chip}` : ''}
                </span>
              </div>
            </div>

            {/* Pourquoi ce choix ? Analyse Timeline Intelligence */}
            <div className="bg-panel/90 border border-line rounded-xl p-5 mb-8">
              <h4 className="font-display font-semibold text-sm text-fg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {t('whyTitle')}
              </h4>
              <ul className="space-y-2.5">
                {winner.whyPoints.map((point, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-dim flex items-start gap-2.5 leading-relaxed">
                    <span className="text-accent font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Barre d'actions Timeline Intelligence */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bouton d'achat prioritaire si buy_url renseigné */}
              {winner.model.buy_url && (
                <a
                  href={winner.model.buy_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="bg-accent text-ink font-bold rounded-xl px-5 py-3 text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Acheter / Voir l&apos;offre</span>
                </a>
              )}

              <Link
                href={`/${locale}/ecouteurs/${winner.model.id}`}
                className="bg-white text-ink font-semibold rounded-xl px-5 py-3 text-xs sm:text-sm flex items-center gap-2 hover:bg-white/90 transition-all shadow-lg"
              >
                <span>{t('viewFullSpecs')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {winner.predecessor && (
                <Link
                  href={`/${locale}/marques/${winner.model.brand_id}/${slugify(winner.model.gamme)}`}
                  className="bg-panel border border-line text-fg hover:border-accent/60 rounded-xl px-4 py-3 text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{t('seeEvolution')} ({winner.predecessor.name})</span>
                </Link>
              )}

              {winner.rival && (
                <Link
                  href={`/${locale}/comparaisons/${buildComparisonSlug(winner.model.id, winner.rival.model.id)}`}
                  className="bg-panel border border-line text-fg hover:border-accent/60 rounded-xl px-4 py-3 text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <Swords className="w-4 h-4 text-amber" />
                  <span>{common('vs')} {winner.rival.model.name}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-panel border border-line rounded-2xl p-12 text-center">
          <p className="text-dim text-sm">{t('noResults')}</p>
        </div>
      )}

      {/* Alternatives ciblées */}
      {alternatives.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="border-t border-line pt-8">
            <h3 className="font-display font-bold text-xl text-fg mb-1">
              {t('alternativesTitle')}
            </h3>
            <p className="text-xs text-dim">{t('alternativesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.model.id}
                className="bg-panel border border-line hover:border-line2 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${alt.tagColor}`}>
                      {alt.tag}
                    </span>
                    <span className="font-display font-bold text-sm text-fg">
                      {alt.model.price ? `${alt.model.price} $` : '—'}
                    </span>
                  </div>

                  <div className="text-[11px] text-dim uppercase tracking-wider mb-1">
                    {alt.brand.name}
                  </div>
                  <h4 className="font-display font-bold text-base text-fg mb-2">
                    {alt.model.name}
                  </h4>
                  <p className="text-xs text-dim leading-relaxed mb-4">
                    {alt.reason}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-line/60">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/ecouteurs/${alt.model.id}`}
                      className="text-xs text-fg hover:text-accent font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>{t('details')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {alt.model.buy_url && (
                      <a
                        href={alt.model.buy_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-xs text-accent hover:underline font-semibold flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Acheter</span>
                      </a>
                    )}
                  </div>

                  {winner && (
                    <Link
                      href={`/${locale}/comparaisons/${buildComparisonSlug(winner.model.id, alt.model.id)}`}
                      className="text-xs text-dim hover:text-fg flex items-center gap-1 transition-colors"
                    >
                      <span>{common('compare')}</span>
                      <Swords className="w-3 h-3 text-accent" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
