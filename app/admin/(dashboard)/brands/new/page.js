import Link from 'next/link';
import { createBrand } from '../actions';
import FormField from '@/components/admin/FormField';

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

      <form action={createBrand} className="max-w-md flex flex-col gap-4">
        <FormField label="Nom" name="name" placeholder="Apple" required />
        <FormField
          label="Identifiant (slug)"
          name="id"
          placeholder="apple"
          hint="Utilisé dans les URL /marques/apple. Laisser vide pour le générer depuis le nom. Non modifiable ensuite."
        />
        <FormField label="Couleur (hex)" name="color" placeholder="#F0F2F5" required />
        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2">
          Créer
        </button>
      </form>
    </>
  );
}
