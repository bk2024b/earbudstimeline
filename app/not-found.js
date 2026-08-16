import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="font-mono text-accent text-sm bg-accent/10 border border-accent/30 rounded-full px-3 py-1 mb-4">
        404
      </div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
        Page introuvable
      </h1>
      <p className="text-dim text-sm max-w-md mb-6">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="bg-accent text-ink font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
