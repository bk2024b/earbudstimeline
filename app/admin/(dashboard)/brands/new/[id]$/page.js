import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { updateBrand } from '../actions';
import FormField from '@/components/admin/FormField';

export const dynamic = 'force-dynamic';

export default async function EditBrandPage({ params, searchParams }) {
  const supabase = getSupabaseAdmin();
  const { data: brand } = await supabase.from('brands').select('*').eq('id', params.id).single();
  if (!brand) notFound();

  const error = searchParams?.error;

  return (
    <>
      <Link href="/admin/brands" className="text-dim text-xs hover:text-accent mb-4 inline-block">
        ← Marques
      </Link>
      <h1 className="font-display font-bold text-2xl mb-1">Modifier {brand.name}</h1>
      <p className="text-dim text-xs mb-6">Identifiant : {brand.id} (non modifiable)</p>

      {error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {error === 'missing' ? 'Tous les champs sont requis.' : error}
        </p>
      )}

      <form
        action={updateBrand.bind(null, brand.id)}
        encType="multipart/form-data"
        className="max-w-md flex flex-col gap-4"
      >
        <FormField label="Nom" name="name" defaultValue={brand.name} required />
        <FormField label="Couleur (hex)" name="color" defaultValue={brand.color} required />

        <div>
          <label className="block text-xs text-dim mb-1.5">Logo</label>
          {brand.image_url && (
            <div className="mb-2.5 w-16 h-16 rounded-lg bg-panel2 border border-line flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.image_url} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
          />
          <p className="text-xs text-dim mt-1.5">Laisser vide pour conserver le logo actuel.</p>
        </div>

        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2">
          Enregistrer
        </button>
      </form>
    </>
  );
}
