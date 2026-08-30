'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { EVOLUTION_METRICS, computeYearlySeries, computeYearlyAdoptionRate } from '@/lib/evolution';

const W = 460;
const H = 200;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 26;

export default function EvolutionChart({ models }) {
  const t = useTranslations('evolution');
  const [tab, setTab] = useState('autonomie');
  const metric = EVOLUTION_METRICS[tab];

  const TABS = [
    { id: 'autonomie', label: t('battery') },
    { id: 'poids', label: t('weight') },
    { id: 'bluetooth', label: t('bluetooth') },
    { id: 'prix', label: t('price') },
    { id: 'anc', label: t('ancAdoption') },
    { id: 'multipoint', label: t('multipointAdoption') },
    { id: 'usbC', label: t('usbCAdoption') },
    { id: 'wirelessCharging', label: t('wirelessChargingAdoption') },
  ];
  const metricLabel = TABS.find((x) => x.id === tab)?.label || '';

  const series = useMemo(
    () =>
      metric.isRate
        ? computeYearlyAdoptionRate(models, metric.boolKey)
        : computeYearlySeries(models, metric.key, { onlyPresent: metric.onlyPresent, parse: metric.parse }),
    [models, metric]
  );

  if (series.length < 2) {
    return (
      <div className="hardware-card bg-panel p-5 sm:p-6">
        <h2 className="font-display font-bold text-base m-0 mb-1">{t('title')}</h2>
        <p className="text-dim text-xs">{t('notEnough')}</p>
      </div>
    );
  }

  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yPad = range * 0.15;

  const xFor = (i) => PAD_L + (i / (series.length - 1)) * (W - PAD_L - PAD_R);
  const yFor = (v) => H - PAD_B - ((v - (min - yPad)) / (range + yPad * 2)) * (H - PAD_T - PAD_B);

  const linePath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.value)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(series.length - 1)} ${H - PAD_B} L ${xFor(0)} ${H - PAD_B} Z`;

  const gridLines = 4;

  return (
    <div className="hardware-card bg-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-base text-fg m-0">{t('title')}</h2>
        <span className="path-indicator text-accent text-[11px]">{metricLabel}</span>
      </div>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TABS.map((tab_) => (
          <button
            key={tab_.id}
            type="button"
            onClick={() => setTab(tab_.id)}
            className={`px-3 py-1.5 rounded-base text-xs font-medium border transition-colors ${
              tab === tab_.id ? 'bg-accent text-ink border-accent font-semibold' : 'bg-panel2 text-dim border-line hover:text-fg'
            }`}
          >
            {tab_.label}
          </button>
        ))}
      </div>

      <p className="text-dim text-[11px] mb-2">
        {metricLabel} {metric.unit && `(${metric.unit})`}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = PAD_T + (i / gridLines) * (H - PAD_T - PAD_B);
          const v = max + yPad - (i / gridLines) * (range + yPad * 2);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} className="stroke-line" strokeWidth="1" />
              <text x={0} y={y + 3} fontSize="9" className="fill-dim" fontFamily="var(--font-mono)">
                {v.toFixed(metric.decimals)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} className="fill-accent" fillOpacity="0.08" stroke="none" />
        <path d={linePath} fill="none" className="stroke-accent" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {series.map((p, i) => (
          <g key={p.year}>
            <circle cx={xFor(i)} cy={yFor(p.value)} r="3.5" className="fill-page stroke-accent" strokeWidth="2" />
            <text
              x={xFor(i)}
              y={H - PAD_B + 16}
              fontSize="9"
              className="fill-dim"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {p.year}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-dim text-[11px] mt-1">{t('trendSuffix', { metric: metricLabel.toLowerCase() })}</p>
    </div>
  );
}
