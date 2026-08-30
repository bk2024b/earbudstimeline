'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import MobileNav from '@/components/MobileNav';
import NavDropdown from '@/components/NavDropdown';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isNavActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const databaseItems = [
    { href: '/ecouteurs', label: t('explore') },
    { href: '/timeline', label: 'Timeline' },
    { href: '/insights', label: t('insights') },
  ];

  return (
    <header className="py-3.5 sm:py-4 mb-6 sm:mb-8 sticky top-0 bg-page/85 backdrop-blur-xl z-30 border-b border-line/60 flex flex-col gap-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex items-center justify-center">
            <Image src="/logo-icon.png" alt="EarbudsTimeline" width={26} height={26} priority className="transition-transform group-hover:scale-105" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight group-hover:text-accent transition-colors hidden xs:inline">
            EarbudsTimeline
          </span>
          <span className="sr-only xs:hidden">EarbudsTimeline</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 lg:gap-5 text-xs uppercase tracking-wider font-display text-dim min-w-0 flex-1 justify-center overflow-x-auto py-1 no-scrollbar">
          <Link href="/trouver-mes-ecouteurs" className={`transition-all flex items-center gap-1.5 px-3 py-1.5 shrink-0 rounded-base ${isNavActive('/trouver-mes-ecouteurs') ? 'bg-accent text-ink font-semibold shadow-glow' : 'text-accent hover:text-fg bg-accent/10 border border-accent/30'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('finder')}</span>
          </Link>
          <Link href="/marques" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/marques') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('brands')}</Link>
          <NavDropdown label={t('database')} items={databaseItems} />
          <Link href="/annees" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/annees') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('years')}</Link>
          <Link href="/technologies" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/technologies') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('technologies')}</Link>
          <Link href="/comparaisons" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/comparaisons') || isNavActive('/comparer') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('comparisons')}</Link>
          <Link href="/guides" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/guides') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('guides') || 'Guides'}</Link>
          <Link href="/blog" className={`transition-colors shrink-0 py-1 px-1.5 ${isNavActive('/blog') ? 'text-fg font-semibold text-accent' : 'hover:text-fg'}`}>{t('blog')}</Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <GlobalSearchModal />
          <div className="hidden md:flex items-center gap-2"><ThemeToggle /><LanguageSwitcher /></div>
          <MobileNav />
        </div>
      </div>

      <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar w-full pt-1 pb-0.5">
        <Link href="/trouver-mes-ecouteurs" className={`transition-all text-xs font-medium flex items-center gap-1 rounded-full px-3 py-1 shrink-0 ${isNavActive('/trouver-mes-ecouteurs') ? 'bg-accent text-ink font-semibold shadow-sm' : 'text-accent bg-accent/10 border border-accent/30'}`}><Sparkles className="w-3 h-3" /><span>{t('finder')}</span></Link>
        <Link href="/marques" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/marques') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('brands')}</Link>
        <Link href="/ecouteurs" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/ecouteurs') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('explore')}</Link>
        <Link href="/timeline" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/timeline') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>Timeline</Link>
        <Link href="/insights" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/insights') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('insights')}</Link>
        <Link href="/comparaisons" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/comparaisons') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('comparisons')}</Link>
        <Link href="/technologies" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/technologies') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('technologies')}</Link>
        <Link href="/guides" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/guides') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('guides') || 'Guides'}</Link>
        <Link href="/blog" className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${isNavActive('/blog') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'}`}>{t('blog')}</Link>
      </div>
    </header>
  );
}
