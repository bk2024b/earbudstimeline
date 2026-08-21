'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import BrandBadge from './BrandBadge';

const BT_OPTIONS = ['5.3', '5.2', '5.1', '5.0'];

export default function InteractiveTimeline({ models, brands, initialAnc = 'all', initialBt = 'all' }) {
  const t = useTranslations('timeline');
  const tc = useTranslations('common');
  const [brandFilter, setBrandFilter] = useState('all');
  const [ancFilter, setAncFilter] = useState(initialAnc);
  const [minBt, setMinBt] = useState(initialBt);
  const maxPriceInData = useMemo(
    () => Math.max(...models.filter((m) => m.price).map((m) => Number(m.price)), 0),
    [models]
  );
  const [maxPrice, setMaxPrice] = useState(maxPriceInData);

  const years = useMemo(() => {
    const set = new Set(models.map((m) => new Date(m.release_date).getFullYear()));
    return [...set].sort((a, b) => a - b);
  }, [models]);

  const filtered = useMemo(() => {
    return models.filter((m) => {
      if (brandFilter !== 'all' && m.brand_id !== brandFilter) return false;
      if (ancFilter === 'yes' && !m.anc) return false;
      if (ancFilter === 'no' && m.anc) return false;
      if (minBt !== 'all' && parseFloat(m.bluetooth) < parseFloat(minBt)) return false;
      if (m.price && Number(m.price) > maxPrice) return false;
      return true;
    });
  }, [models, brandFilter, ancFilter, minBt, maxPrice]);

  const rows = useMemo(() => {
    const byBrand = new Map();
    for (const m of filtered) {
      if (!byBrand.has(m.brand_id)) byBrand.set(m.brand_id, []);
      byBrand.get(m.brand_id).push(m);
    }
    return brands.filter((b) => byBrand.has(b.id)).map((b) => ({ brand: b, items: byBrand.get(b.id) }));
  }, [filtered, brands]);

  function resetFilters() {
    setAncFilter('all');
    setMinBt('all');
    setMaxPrice(maxPriceInData);
  }

  const filtersActive = ancFilter !== 'all' || minBt !== 'all' || maxPrice !== maxPriceInData;

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 mb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="text-[15px] m-0">{t('interactive')}</h2>
        <p className="m-0 text-dim text-xs">{t('results', { count: filtered.length })}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setBrandFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
            brandFilter === 'all' ? 'bg-accent text-ink border-accent' : 'bg-panel2 text-dim border-line hover:text-fg'
          }`}
        >
          {t('all')}
        </button>
        {brands.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBrandFilter(b.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
              brandFilter === b.id
                ? 'bg-accent text-ink border-accent'
                : 'bg-panel2 text-dim border-line hover:text-fg'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="bg-panel2 border border-line rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="m-0 text-xs text-dim uppercase tracking-[0.08em]">{t('advancedFilters')}</p>
          {filtersActive && (
            <button type="button" onClick={resetFilters} className="text-xs text-accent hover:underline">
              {t('reset')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-dim">{t('ancFilter')}</span>
            <select
              value={ancFilter}
              onChange={(e) => setAncFilter(e.target.value)}
              className="bg-panel border border-line rounded-lg px-2.5 py-2 text-[13px]"
            >
              <option value="all">{t('ancAll')}</option>
              <option value="yes">{t('ancWith')}</option>
              <option value="no">{t('ancWithout')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-dim">{t('minBluetooth')}</span>
            <select
              value={minBt}
              onChange={(e) => setMinBt(e.target.value)}
              className="bg-panel border border-line rounded-lg px-2.5 py-2 text-[13px]"
            >
              <option value="all">{t('allVersions')}</option>
              {BT_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}+
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-dim">
              {t('maxPrice')} : <span className="font-mono text-fg">{maxPrice} $</span>
            </span>
            <input
              type="range"
              min={0}
              max={maxPriceInData}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-accent"
            />
          </label>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-dim text-sm py-8 text-center">{t('noResults')}</p>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ minWidth: Math.max(600, years.length * 90) }}>
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${years.length}, 1fr)` }}>
              <div />
              {years.map((y) => (
                <div key={y} className="text-center font-mono text-[10px] text-dim pb-2">
                  {y}
                </div>
              ))}

              {rows.map(({ brand, items }) => (
                <RowCells key={brand.id} brand={brand} items={items} years={years} />
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-dim text-[11px] mt-3">{t('clickHint')}</p>
    </div>
  );
}

function RowCells({ brand, items, years }) {
  const byYear = new Map();
  for (const m of items) {
    const y = new Date(m.release_date).getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(m);
  }

  return (
    <>
      <div className="flex items-center gap-2 py-2 border-t border-line">
        <BrandBadge brand={brand} size={20} />
        <span className="text-xs truncate">{brand.name}</span>
      </div>
      {years.map((y) => (
        <div key={y} className="flex items-center justify-center gap-1 py-2 border-t border-line">
          {(byYear.get(y) || []).map((m) => (
            <Link
              key={m.id}
              href={`/ecouteurs/${m.id}`}
              title={m.name}
              aria-label={m.name}
              className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform hover:scale-150"
              style={{ background: brand.color }}
            />
          ))}
        </div>
      ))}
    </>
  );
}
