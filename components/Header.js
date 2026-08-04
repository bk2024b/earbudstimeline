import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex items-center justify-between py-5 mb-8 sticky top-0 bg-ink/90 backdrop-blur z-20">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex items-end gap-[2px] h-4" aria-hidden>
          <span className="w-[3px] h-2 bg-accent rounded-full" />
          <span className="w-[3px] h-4 bg-accent rounded-full" />
          <span className="w-[3px] h-2.5 bg-accent rounded-full" />
        </span>
        <span className="font-display font-bold text-lg">EarbudsTimeline</span>
      </Link>
      <nav className="flex items-center gap-7 text-sm text-dim">
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
