export function computeStats(models) {
  const n = models.length || 1;

  const avgCaseH = models.reduce((s, m) => s + Number(m.battery_case_h), 0) / n;

  const priced = models.filter((m) => m.price);
  const avgPrice = priced.length
    ? Math.round(priced.reduce((s, m) => s + Number(m.price), 0) / priced.length)
    : null;

  const btCounts = {};
  models.forEach((m) => {
    if (m.bluetooth) btCounts[m.bluetooth] = (btCounts[m.bluetooth] || 0) + 1;
  });
  const commonBt = Object.entries(btCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const brandCounts = {};
  models.forEach((m) => {
    brandCounts[m.brand_id] = (brandCounts[m.brand_id] || 0) + 1;
  });
  const topBrandId = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    avgCaseH: Math.round(avgCaseH * 10) / 10,
    avgPrice,
    commonBt,
    topBrandId,
  };
}
