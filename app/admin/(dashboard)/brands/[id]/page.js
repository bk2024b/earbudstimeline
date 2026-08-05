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

      <form action={updateBrand.bind(null, brand.id)} className="max-w-md flex flex-col gap-4">
        <FormField label="Nom" name="name" defaultValue={brand.name} required />
        <FormField label="Couleur (hex)" name="color" defaultValue={brand.color} required />
        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2">
          Enregistrer
        </button>
      </form>
    </>
  );
}
