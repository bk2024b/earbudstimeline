import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandById, getEarbudsByBrand } from '@/lib/queries';
import ModelCard from '@/components/ModelCard';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export default async function BrandPage({ params, searchParams }) {
  const brand = await getBrandById(params.brand).catch(() => null);
  if (!brand) notFound();

  const models = await getEarbudsByBrand(params.brand);
  const gammes = [...new Set(models.map((m) => m.gamme))].map((g) => ({
    name: g,
    count: models.filter((m) => m.gamme === g).length,
  }));

  const activeGamme = searchParams.gamme || 'all';
  const filtered = activeGamme === 'all' ? models : models.filter((m) => m.gamme === activeGamme);
  const years = models.map((m) => Number(m.release_date.slice(0, 4)));

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1.5 text-dim text-[13px] mb-6 hover:text-accent">
        ← Toutes les marques
      </Link>
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Marque</div>
      <h1 className="font-display font-bold text-[34px] mb-2">{brand.name}</h1>
      <p className="text-dim mb-8">
        {models.length} modèles · {Math.min(...years)} → {Math.max(...years)}
      </p>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Gammes</h2>
      <div className="flex gap-2 flex-wrap mb-8">
        <Chip href={`/marques/${brand.id}`} active={activeGamme === 'all'}>
          Tous
        </Chip>
        {gammes.map((g) => (
          <Chip
            key={g.name}
            href={`/marques/${brand.id}?gamme=${encodeURIComponent(g.name)}`}
            active={activeGamme === g.name}
          >
            {g.name} · {g.count}
          </Chip>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Tous les modèles</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {filtered.map((m) => (
          <ModelCard key={m.id} m={m} />
        ))}
      </div>
      <Footer />
    </>
  );
}

function Chip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-1.5 rounded-full border text-xs transition-colors ${
        active ? 'bg-accent/15 border-accent text-accent' : 'border-line text-dim hover:border-accent'
      }`}
    >
      {children}
    </Link>
  );
}
