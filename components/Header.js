import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex items-center justify-between py-5 mb-8 sticky top-0 bg-ink/90 backdrop-blur z-20">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo-icon.png" alt="" width={28} height={28} priority />
        <span className="font-display font-bold text-lg">EarbudsTimeline</span>
      </Link>
      <nav className="flex items-center gap-7 text-sm text-dim">
        <Link href="/#marques" className="hover:text-white transition-colors">
          Marques
        </Link>
        <Link href="/comparaisons" className="hover:text-white transition-colors">
          Comparaisons
        </Link>
        <Link href="/blog" className="hover:text-white transition-colors">
          Blog
        </Link>
      </nav>
    </div>
  );
}
