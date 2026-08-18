import Link from 'next/link';
import AncCsvImportForm from '@/components/admin/AncCsvImportForm';

export default function AncImportPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/anc" className="text-xs text-dim hover:text-white">← Queue ANC</Link>
        <h1 className="font-display font-bold text-2xl mt-2">Importer des preuves ANC</h1>
        <p className="text-sm text-dim mt-1">Import séparé du CSV général des écouteurs.</p>
      </div>
      <AncCsvImportForm />
    </div>
  );
}
