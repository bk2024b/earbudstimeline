import Image from 'next/image';

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
      className="rounded-lg flex items-center justify-center font-display font-bold text-ink shrink-0"
      style={{ width: size, height: size, background: brand.color, fontSize: size * 0.42 }}
    >
      {brand.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
