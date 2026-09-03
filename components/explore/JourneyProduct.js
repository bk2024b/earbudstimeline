function SpecGrid({ chapter, locale }) {
  const fr = locale !== 'en';
  const specs = [
    [fr ? 'Prix lancement' : 'Launch price', chapter.price != null ? `${chapter.price} $` : '—'],
    ['ANC', chapter.anc ? (fr ? 'Oui' : 'Yes') : (fr ? 'Non' : 'No')],
    [fr ? 'Autonomie totale' : 'Total battery', chapter.battery_case_h != null ? `${chapter.battery_case_h} h` : '—'],
    [fr ? 'Résistance' : 'Water rating', chapter.water_rating || '—'],
  ];
  return <div className="journey-spec-grid">{specs.map(([label, value]) => <div className="journey-spec" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>;
}

export default function JourneyProduct({ chapter, locale = 'fr' }) {
  return (
    <div className="journey-product">
      <div className="journey-product-frame">
        {chapter.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={chapter.image_url} alt={chapter.name} />
        ) : (
          <svg className="journey-fallback-glyph" viewBox="0 0 64 76" fill="none" aria-hidden="true">
            <rect x="6" y="4" width="24" height="46" rx="12" fill={chapter.brandColor || '#9A9AA3'} opacity=".9" />
            <rect x="34" y="4" width="24" height="46" rx="12" fill={chapter.brandColor || '#9A9AA3'} opacity=".55" />
            <rect x="12" y="50" width="12" height="24" rx="6" fill="#3a3f3c" />
            <rect x="40" y="50" width="12" height="24" rx="6" fill="#3a3f3c" />
          </svg>
        )}
      </div>
      <SpecGrid chapter={chapter} locale={locale} />
    </div>
  );
}
