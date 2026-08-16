import Link from 'next/link';
import { createBrand } from '../actions';
import FormField from '@/components/admin/FormField';

export const dynamic = 'force-dynamic';

export default function NewBrandPage({ searchParams }) {
  const error = searchParams?.error;
  return (
    <>
      <Link href="/admin/brands" className="text-dim text-xs hover:text-accent mb-4 inline-block">
        ← Marques
      </Link>
      <h1 className="font-display font-bold text-2xl mb-6">Nouvelle marque</h1>

      {error && (
        <p className="text-rose-400 text-sm mb-4">
          Erreur : {error === 'missing' ? 'Tous les champs sont requis.' : error}
        </p>
      )}

      <form action={createBrand} encType="multipart/form-data" className="max-w-md flex flex-col gap-4">
        <FormField label="Nom" name="name" placeholder="Apple" required />
        <FormField
          label="Identifiant (slug)"
          name="id"
          placeholder="apple"
          hint="Utilisé dans les URL /marques/apple. Laisser vide pour le générer depuis le nom. Non modifiable ensuite."
        />
        <FormField label="Couleur (hex)" name="color" placeholder="#F0F2F5" required />

        <div>
          <label className="block text-xs text-dim mb-1.5">Logo (optionnel)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
          />
          <p className="text-xs text-dim mt-1.5">
            Sans logo, l&apos;initiale du nom sur fond de la couleur choisie est utilisée à la place.
          </p>
        </div>

        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2">
          Créer
        </button>
      </form>
    </>
  );
}
