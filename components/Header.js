'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import MobileNav from '@/components/MobileNav';
import { Sparkles } from 'lucide-react';

export default function Header({ models = [], brands = [] }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isNavActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="py-3 sm:py-5 mb-6 sm:mb-8 sticky top-0 bg-page/95 backdrop-blur z-20 border-b border-line/40 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo-icon.png" alt="" width={28} height={28} priority />
          <span className="font-display font-bold text-lg hidden xs:inline">EarbudsTimeline</span>
          <span className="sr-only xs:hidden">EarbudsTimeline</span>
        </Link>

        {/* Navigation desktop — masquée en dessous de md */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-6 text-sm text-dim min-w-0 flex-1 justify-center overflow-x-auto py-1 no-scrollbar">
          <Link
            href="/trouver-mes-ecouteurs"
            className={`transition-all font-medium flex items-center gap-1.5 rounded-full px-3 py-1.5 shrink-0 ${
              isNavActive('/trouver-mes-ecouteurs')
                ? 'bg-accent text-ink font-semibold shadow-sm'
                : 'text-accent hover:text-fg bg-accent/10 border border-accent/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('finder')}</span>
          </Link>
          <Link
            href="/marques"
            className={`transition-colors shrink-0 ${
              isNavActive('/marques') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            {t('brands')}
          </Link>
          <Link
            href="/timeline"
            className={`transition-colors shrink-0 ${
              isNavActive('/timeline') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            Timeline
          </Link>
          <Link
            href="/annees"
            className={`transition-colors shrink-0 ${
              isNavActive('/annees') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            {t('years')}
          </Link>
          <Link
            href="/technologies"
            className={`transition-colors shrink-0 ${
              isNavActive('/technologies') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            {t('technologies')}
          </Link>
          <Link
            href="/comparaisons"
            className={`transition-colors shrink-0 ${
              isNavActive('/comparaisons') || isNavActive('/comparer') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            {t('comparisons')}
          </Link>
          <Link
            href="/blog"
            className={`transition-colors shrink-0 ${
              isNavActive('/blog') ? 'text-fg font-semibold' : 'hover:text-fg'
            }`}
          >
            {t('blog')}
          </Link>
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 shrink-0">
          <GlobalSearchModal models={models} brands={brands} />
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <MobileNav />
        </div>
      </div>

      {/* Barre de raccourcis défilante sur mobile */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar w-full pt-1 pb-0.5">
        <Link
          href="/trouver-mes-ecouteurs"
          className={`transition-all text-xs font-medium flex items-center gap-1 rounded-full px-3 py-1 shrink-0 ${
            isNavActive('/trouver-mes-ecouteurs')
              ? 'bg-accent text-ink font-semibold shadow-sm'
              : 'text-accent bg-accent/10 border border-accent/30'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{t('finder')}</span>
        </Link>
        <Link
          href="/marques"
          className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${
            isNavActive('/marques') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'
          }`}
        >
          {t('brands')}
        </Link>
        <Link
          href="/timeline"
          className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${
            isNavActive('/timeline') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'
          }`}
        >
          Timeline
        </Link>
        <Link
          href="/comparaisons"
          className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${
            isNavActive('/comparaisons') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'
          }`}
        >
          {t('comparisons')}
        </Link>
        <Link
          href="/technologies"
          className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${
            isNavActive('/technologies') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'
          }`}
        >
          {t('technologies')}
        </Link>
        <Link
          href="/blog"
          className={`transition-colors text-xs px-3 py-1 rounded-full border border-line shrink-0 ${
            isNavActive('/blog') ? 'bg-panel2 text-accent font-semibold border-accent/40' : 'text-dim hover:text-fg'
          }`}
        >
          {t('blog')}
        </Link>
      </div>
    </header>
  );
}
