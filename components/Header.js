import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex items-center justify-between py-5 border-b border-line mb-8 sticky top-0 bg-ink/95 backdrop-blur z-20">
      <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_#46E0C8]" />
        EarbudsTimeline
      </Link>
      <nav className="flex gap-5 text-sm text-dim">
        <Link href="/#marques" className="hover:text-white transition-colors">
          Marques
        </Link>
        <Link href="/comparer" className="hover:text-white transition-colors">
          Comparateur
        </Link>
      </nav>
    </div>
  );
}
