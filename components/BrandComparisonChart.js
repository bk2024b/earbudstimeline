'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { EVOLUTION_METRICS, computeYearlySeriesByBrand } from '@/lib/evolution';

const W = 720;
const H = 320;
const PAD_L = 40;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const DEFAULT_BRAND_COUNT = 6;

// Le "méga-graphe" : une métrique, toutes les marques sélectionnées
// superposées sur la même échelle. Contrairement à EvolutionChart (une
// ligne), ici on affiche plusieurs séries — donc une échelle Y partagée
// calculée sur l'ensemble des marques visibles, pas juste une.
export default function BrandComparisonChart({ models, brands }) {
  const t = useTranslations('evolution');
  const [tab, setTab] = useState('autonomie');
  const metric = EVOLUTION_METRICS[tab];

  const TABS = [
    { id: 'autonomie', label: t('battery') },
    { id: 'poids', label: t('weight') },
    { id: 'prix', label: t('price') },
    { id: 'anc', label: t('ancAdoption') },
    { id: 'multipoint', label: t('multipointAdoption') },
  ];
  const metricLabel = TABS.find((x) => x.id === tab)?.label || '';

  const brandsByCount = useMemo(
    () =>
      [...brands]
        .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
        .sort((a, b) => b.count - a.count),
    [models, brands]
  );

  const [activeBrandIds, setActiveBrandIds] = useState(() =>
    brandsByCount.slice(0, DEFAULT_BRAND_COUNT).map((b) => b.id)
  );

  const toggleBrand = (id) => {
    setActiveBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const seriesByBrand = useMemo(() => computeYearlySeriesByBrand(models, metric), [models, metric]);

  const activeSeries = activeBrandIds
    .map((id) => ({ brand: brands.find((b) => b.id === id), series: seriesByBrand.get(id) }))
    .filter((x) => x.brand && x.series && x.series.length >= 2);

  if (activeSeries.length === 0) {
    return (
      <div className="hardware-card bg-panel p-5 sm:p-6">
        <h2 className="font-display font-bold text-base text-fg m-0 mb-1">{t('megaChartTitle')}</h2>
        <p className="text-dim text-xs">{t('notEnough')}</p>
      </div>
    );
  }

  const allYears = [...new Set(activeSeries.flatMap((s) => s.series.map((p) => p.year)))].sort((a, b) => a - b);
  const allValues = activeSeries.flatMap((s) => s.series.map((p) => p.value));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const yPad = range * 0.15;

  const xFor = (year) => PAD_L + ((year - allYears[0]) / (allYears[allYears.length - 1] - allYears[0] || 1)) * (W - PAD_L - PAD_R);
  const yFor = (v) => H - PAD_B - ((v - (min - yPad)) / (range + yPad * 2)) * (H - PAD_T - PAD_B);
  const gridLines = 4;

  return (
    <div className="hardware-card bg-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-bold text-base text-fg m-0">{t('megaChartTitle')}</h2>
        <span className="path-indicator text-accent text-[11px]">{metricLabel}</span>
      </div>
      <p className="text-dim text-xs mb-4">{t('megaChartIntro')}</p>

      <div className="flex gap-1.5 mb-4 flex-wrap">
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

      <div className="flex flex-wrap gap-1.5 mb-4">
        {brandsByCount.slice(0, 14).map((b) => {
          const active = activeBrandIds.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggleBrand(b.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                active ? 'border-transparent text-ink' : 'bg-panel2 border-line text-dim hover:text-fg'
              }`}
              style={active ? { backgroundColor: b.color } : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? undefined : b.color }} />
              {b.name}
            </button>
          );
        })}
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
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#27272A" strokeWidth="1" />
              <text x={0} y={y + 3} fontSize="9" fill="#9A9AA3" fontFamily="var(--font-mono)">
                {v.toFixed(metric.decimals)}
              </text>
            </g>
          );
        })}

        {allYears.map((year) => (
          <text key={year} x={xFor(year)} y={H - PAD_B + 16} fontSize="9" fill="#9A9AA3" textAnchor="middle" fontFamily="var(--font-mono)">
            {year}
          </text>
        ))}

        {activeSeries.map(({ brand, series }) => {
          const path = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.year)} ${yFor(p.value)}`).join(' ');
          return (
            <g key={brand.id}>
              <path d={path} fill="none" stroke={brand.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {series.map((p) => (
                <circle key={p.year} cx={xFor(p.year)} cy={yFor(p.value)} r="3" fill="#0A0A0B" stroke={brand.color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
