import Image from 'next/image';

// Choisit un texte clair ou foncé selon la luminance réelle de la couleur de
// la marque, plutôt qu'un "text-ink" fixe qui devient illisible sur les
// couleurs de marque sombres (ex. bleu marine) — bug de contraste repéré par
// un audit Lighthouse.
function readableTextColor(hex) {
  if (!hex) return '#0A0A0B';
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return '#0A0A0B';
  // Luminance relative (WCAG) — seuil 0.5 pour choisir clair vs foncé
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0A0A0B' : '#FFFFFF';
}

export default function BrandBadge({ brand, size = 28 }) {
  if (brand.image_url) {
    return (
      <Image
        src={brand.image_url}
        alt={brand.name}
        width={size}
        height={size}
        className="rounded-lg object-contain bg-panel2 border border-line shrink-0"
      />
    );
  }
  return (
    <span
      className="rounded-lg flex items-center justify-center font-display font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: brand.color,
        fontSize: size * 0.42,
        color: readableTextColor(brand.color),
      }}
    >
      {brand.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
