'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Activity, Battery, CheckCircle2, DollarSign, ExternalLink, Headphones, Shield, Sparkles, Volume2, Zap } from 'lucide-react';
import { analyzeEarbudsForBudget } from '@/lib/ancIntelligence';

const PRESETS = [99, 149, 199, 249, 299, 500];
const PRIORITIES = [
  ['balanced', Sparkles],
  ['anc', Volume2],
  ['commute', Zap],
  ['battery', Battery],
  ['sport', Activity],
  ['value', DollarSign],
];

function Score({ label, value }) {
  return (
    <div className="bg-panel/70 border border-line rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-dim mb-1">{label}</div>
      <div className="font-display font-bold text-lg text-white">
        {value == null ? <span className="text-dim">—</span> : `${value}/100`}
      </div>
    </div>
  );
}

export default function AncIntelligenceFinder({ initialModels = [], initialBrands = [], initialAncScores = [] }) {
  const locale = useLocale();
  const t = useTranslations('intelligence');
  const [maxBudget, setMaxBudget] = useState(200);
  const [priority, setPriority] = useState('balanced');
  const [brandId, setBrandId] = useState('all');

  const analysis = useMemo(() => analyzeEarbudsForBudget(initialModels, initialBrands, initialAncScores, {
    maxBudget, priority, brandId, locale,
  }), [initialModels, initialBrands, initialAncScores, maxBudget, priority, brandId, locale]);

  const { winner, alternatives, totalUnderBudget } = analysis;
  const priorities = {
    balanced: t('priorities.balanced'), anc: t('priorities.anc'), commute: t('priorities.commute'),
    battery: t('priorities.battery'), sport: t('priorities.sport'), value: t('priorities.value'),
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-panel border border-line rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent"><Headphones className="w-5 h-5" /></div>
          <div><h2 className="font-display font-bold text-xl text-white">{t('controlTitle')}</h2><p className="text-xs text-dim">{t('controlSubtitle')}</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-3"><span className="text-xs font-semibold uppercase tracking-wider text-dim">{t('budgetLabel')}</span><strong className="text-accent">{maxBudget >= 500 ? t('unlimitedBudget') : `${maxBudget} $`}</strong></div>
            <input aria-label={t('budgetLabel')} type="range" min="50" max="500" step="10" value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))} className="w-full accent-accent" />
            <div className="flex flex-wrap gap-2 mt-4">{PRESETS.map((p) => <button key={p} onClick={() => setMaxBudget(p)} className={`text-xs px-3 py-1.5 rounded-lg border ${maxBudget === p ? 'bg-accent text-ink border-accent font-semibold' : 'bg-panel2 border-line text-dim hover:text-white'}`}>{p >= 500 ? t('all') : `≤ ${p} $`}</button>)}</div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-dim block mb-3">{t('ecosystemLabel')}</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBrandId('all')} className={`text-xs px-3.5 py-2 rounded-lg border ${brandId === 'all' ? 'bg-white text-ink border-white font-semibold' : 'bg-panel2 border-line text-dim'}`}>{t('allBrands')}</button>
              {initialBrands.map((b) => <button key={b.id} onClick={() => setBrandId(b.id)} className={`text-xs px-3.5 py-2 rounded-lg border ${brandId === b.id ? 'bg-accent/15 border-accent text-white font-semibold' : 'bg-panel2 border-line text-dim hover:text-white'}`}>{b.name}</button>)}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-line/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-dim block mb-3">{t('priorityLabel')}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PRIORITIES.map(([id, Icon]) => <button key={id} onClick={() => setPriority(id)} className={`flex flex-col items-center p-3 rounded-xl border ${priority === id ? 'bg-accent/15 border-accent text-white' : 'bg-panel2 border-line text-dim hover:text-white'}`}><Icon className="w-4 h-4 mb-1.5" /><span className="text-xs">{priorities[id]}</span></button>)}
          </div>
        </div>
      </section>

      {winner && <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-panel p-6 sm:p-9 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" /> #1 Timeline Intelligence</span><span className="text-xs text-dim">{totalUnderBudget} {t('modelsAnalyzed')}</span></div>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div><div className="text-xs uppercase tracking-widest text-dim mb-1">{winner.brand.name} • {winner.model.gamme}</div><h2 className="font-display font-bold text-3xl text-white">{winner.model.name}</h2><p className="text-dim text-sm mt-1">Timeline Score <strong className="text-white">{winner.score}/100</strong></p></div>
          <div className="text-3xl font-bold text-white">{winner.model.price ? `${winner.model.price} $` : '—'}</div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white"><Shield className="w-4 h-4 text-accent" /> ANC Intelligence</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <Score label="ANC Score" value={winner.metrics.ancScore} />
            <Score label="Travel" value={winner.metrics.ancTravel} />
            <Score label="Office" value={winner.metrics.ancOffice} />
            <Score label="Traffic" value={winner.metrics.ancTraffic} />
            <Score label="Voices" value={winner.metrics.ancVoices} />
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-dim"><span>Coverage: <strong className="text-white">{winner.metrics.ancCoverage}%</strong></span><span>Evidence: <strong className="text-white">{winner.metrics.ancEvidenceCount}</strong></span><span>Sources: <strong className="text-white">{winner.metrics.ancSourceCount}</strong></span><span>Confidence: <strong className="text-white">{winner.metrics.ancConfidence}%</strong></span></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Score label="Battery" value={winner.metrics.batteryScore} /><Score label="Comfort" value={winner.metrics.comfortScore} /><Score label="Water" value={winner.metrics.waterScore} /><Score label="Value" value={winner.metrics.valueScore} />
        </div>
        <div className="bg-panel2 border border-line rounded-xl p-5"><h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t('whyTitle')}</h3><ul className="space-y-2">{winner.whyPoints.map((p, i) => <li key={i} className="text-xs sm:text-sm text-dim">• {p}</li>)}</ul></div>
        <div className="flex flex-wrap gap-3 mt-6"><Link href={`/${locale}/ecouteurs/${winner.model.id}`} className="inline-flex items-center gap-2 bg-accent text-ink font-bold rounded-xl px-5 py-3 text-sm">Voir la fiche <ExternalLink className="w-4 h-4" /></Link>{winner.model.buy_url && <a href={winner.model.buy_url} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 border border-line rounded-xl px-5 py-3 text-sm text-white">Acheter</a>}</div>
      </section>}

      {alternatives.length > 0 && <section><h2 className="font-display font-bold text-xl text-white mb-4">{locale === 'en' ? 'Other strong matches' : 'Autres excellentes options'}</h2><div className="grid md:grid-cols-3 gap-4">{alternatives.map((item) => <Link key={item.model.id} href={`/${locale}/ecouteurs/${item.model.id}`} className="bg-panel border border-line hover:border-line2 rounded-2xl p-5 transition-colors"><div className="text-[10px] uppercase tracking-wider text-accent mb-2">{item.tag}</div><h3 className="font-semibold text-white">{item.model.name}</h3><p className="text-xs text-dim mt-2">{item.reason}</p><div className="mt-4 text-xs text-dim">ANC {item.metrics.ancScore == null ? '—' : `${item.metrics.ancScore}/100`} · Travel {item.metrics.ancTravel == null ? '—' : item.metrics.ancTravel}</div></Link>)}</div></section>}
    </div>
  );
}
