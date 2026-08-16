import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const supabase = getSupabaseAdmin();
  const [
    { count: brandsCount },
    { count: earbudsCount },
    { data: earbudsWithoutImage },
    { data: articles },
  ] = await Promise.all([
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('earbuds').select('*', { count: 'exact', head: true }),
    supabase.from('earbuds').select('id, name, brand_id').is('image_url', null),
    supabase.from('articles').select('id, locale, translation_of, title, status'),
  ]);

  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter((a) => a.status === 'published').length || 0;
  const draftArticles = articles?.filter((a) => a.status === 'draft').length || 0;

  const missingTranslations = (articles || []).filter(
    (a) => a.locale === 'fr' && !(articles || []).some((x) => x.translation_of === a.id)
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-2xl mb-1">Tableau de bord</h1>
        <p className="text-xs text-dim">Vue d&apos;ensemble et raccourcis de gestion.</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between">
          <span className="text-dim text-xs uppercase tracking-wide">Marques</span>
          <b className="font-display text-3xl text-white mt-2">{brandsCount ?? 0}</b>
        </div>
        <div className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between">
          <span className="text-dim text-xs uppercase tracking-wide">Écouteurs</span>
          <b className="font-display text-3xl text-white mt-2">{earbudsCount ?? 0}</b>
        </div>
        <div className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between">
          <span className="text-dim text-xs uppercase tracking-wide">Articles publiés</span>
          <b className="font-display text-3xl text-emerald-400 mt-2">{publishedArticles}</b>
        </div>
        <div className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between">
          <span className="text-dim text-xs uppercase tracking-wide">Brouillons</span>
          <b className="font-display text-3xl text-amber mt-2">{draftArticles}</b>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-panel border border-line rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">⚡ Actions rapides</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/earbuds/new"
            className="bg-accent text-ink font-semibold rounded-lg px-3.5 py-2 text-xs hover:opacity-90 flex items-center gap-1.5"
          >
            <span>+</span> Nouvel écouteur
          </Link>
          <Link
            href="/admin/articles/new"
            className="bg-panel2 border border-line text-white font-medium rounded-lg px-3.5 py-2 text-xs hover:border-accent flex items-center gap-1.5"
          >
            <span>+</span> Nouvel article
          </Link>
          <Link
            href="/admin/earbuds/import-csv"
            className="bg-panel2 border border-line text-dim hover:text-white rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <span>📄</span> Import CSV écouteurs
          </Link>
          <Link
            href="/admin/earbuds/bulk-images"
            className="bg-panel2 border border-line text-dim hover:text-white rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <span>📤</span> Import photos
          </Link>
        </div>
      </div>

      {/* Alertes de complétude des données */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Écouteurs sans photo */}
        <div className="bg-panel border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>📷</span> Écouteurs sans photo
            </h3>
            <span className="text-xs text-amber font-mono font-bold">
              {earbudsWithoutImage?.length || 0}
            </span>
          </div>
          {earbudsWithoutImage && earbudsWithoutImage.length > 0 ? (
            <div className="flex flex-col gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
              {earbudsWithoutImage.slice(0, 6).map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/earbuds/${e.id}`}
                  className="flex items-center justify-between py-1 px-2 rounded bg-panel2 text-dim hover:text-white hover:border-line border border-transparent"
                >
                  <span className="truncate">{e.name}</span>
                  <span className="text-[10px] text-accent shrink-0">Ajouter photo →</span>
                </Link>
              ))}
              {earbudsWithoutImage.length > 6 && (
                <Link
                  href="/admin/earbuds/bulk-images"
                  className="text-[11px] text-accent hover:underline pt-1 block"
                >
                  Voir tous les {earbudsWithoutImage.length} sans photo dans l&apos;import multiple →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-400">✓ Tous les écouteurs ont une photo !</p>
          )}
        </div>

        {/* Articles à traduire */}
        <div className="bg-panel border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>🌐</span> Traductions manquantes (FR ➔ EN)
            </h3>
            <span className="text-xs text-purple-300 font-mono font-bold">
              {missingTranslations.length}
            </span>
          </div>
          {missingTranslations.length > 0 ? (
            <div className="flex flex-col gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
              {missingTranslations.slice(0, 6).map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/articles/new?translationOf=${a.id}`}
                  className="flex items-center justify-between py-1 px-2 rounded bg-panel2 text-dim hover:text-white hover:border-line border border-transparent"
                >
                  <span className="truncate">{a.title}</span>
                  <span className="text-[10px] text-accent shrink-0">Traduire →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400">✓ Tous les articles FR ont leur version anglaise !</p>
          )}
        </div>
      </div>
    </div>
  );
}
