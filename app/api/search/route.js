import { NextResponse } from 'next/server';
import { getSearchCatalog, getBrands } from '@/lib/queries';

// Recherche globale (barre de recherche du Header, GlobalSearchModal).
//
// Avant : le catalogue complet (658+ écouteurs) et toutes les marques
// étaient passés en props depuis app/[locale]/layout.js jusqu'à Header
// ('use client'), donc sérialisés dans le payload RSC et hydratés en JS sur
// CHAQUE page du site, juste pour permettre une recherche client-side qui ne
// sert que si la modale est ouverte. Ici, on ne renvoie que le nécessaire —
// à la demande, quand quelqu'un tape effectivement une recherche.
//
// getSearchCatalog()/getBrands() restent mis en cache (unstable_cache,
// revalidate 3600, voir lib/queries.js) : cette route ne tape donc pas
// Supabase à chaque frappe, seulement la première fois après une revalidation.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  if (!q) return NextResponse.json({ results: [] });

  const [models, brands] = await Promise.all([getSearchCatalog(), getBrands()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));

  const results = models
    .filter((m) => {
      const brandName = brandMap.get(m.brand_id)?.name || m.brand_id;
      return `${m.name} ${brandName} ${m.gamme}`.toLowerCase().includes(q);
    })
    .slice(0, 8)
    .map((m) => {
      const brand = brandMap.get(m.brand_id);
      return {
        id: m.id,
        name: m.name,
        brand_id: m.brand_id,
        brand_name: brand?.name || m.brand_id,
        brand_color: brand?.color || '#6C8CFF',
        brand_image_url: brand?.image_url || null,
        gamme: m.gamme,
        release_date: m.release_date,
        price: m.price,
        anc: m.anc,
      };
    });

  return NextResponse.json({ results });
}
