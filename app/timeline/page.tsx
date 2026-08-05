import Link from "next/link";
import { getTimelineData } from "@/lib/queries/timeline";
import TimelineExplorer from "@/components/public/TimelineExplorer";
import Logo from "@/components/public/Logo";

export default async function TimelinePage() {
  const brands = await getTimelineData();

  return (
    <div className="bg-night text-white min-h-screen">
      <header className="sticky top-0 z-50 bg-night/90 backdrop-blur border-b border-hairline">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo light />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <Link href="/marques" className="hover:text-white transition-colors">
              Marques
            </Link>
            <Link href="/timeline" className="text-white">
              Timeline
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-signal mb-4">
          Explorateur
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">
          Timeline interactive
        </h1>
        <p className="text-muted max-w-lg">
          Toutes les marques, toutes les années, sur un seul axe. Compare
          plusieurs marques en même temps, zoome, glisse pour explorer.
        </p>
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <TimelineExplorer brands={brands} />
      </main>

      <footer className="border-t border-hairline py-8">
        <div className="max-w-6xl mx-auto px-6 text-xs text-muted">© 2026 PhoneTimeline</div>
      </footer>
    </div>
  );
}
