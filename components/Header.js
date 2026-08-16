'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import { Sparkles } from 'lucide-react';

export default function Header({ models = [], brands = [] }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isNavActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="flex items-center justify-between py-4 sm:py-5 mb-8 sticky top-0 bg-ink/90 backdrop-blur z-20 gap-3 sm:gap-6 border-b border-line/40">
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <Image src="/logo-icon.png" alt="" width={28} height={28} priority />
        <span className="font-display font-bold text-lg hidden xs:inline">EarbudsTimeline</span>
      </Link>

      <nav className="flex items-center gap-3 sm:gap-6 text-sm text-dim overflow-x-auto py-1 no-scrollbar">
        <Link
          href="/trouver-mes-ecouteurs"
          className={`transition-all font-medium flex items-center gap-1.5 rounded-full px-3 py-1 shrink-0 ${
            isNavActive('/trouver-mes-ecouteurs')
              ? 'bg-accent text-ink font-semibold shadow-sm'
              : 'text-accent hover:text-white bg-accent/10 border border-accent/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('finder')}</span>
        </Link>
        <Link
          href="/#marques"
          className={`transition-colors shrink-0 ${
            pathname === '/' ? 'text-white' : 'hover:text-white'
          }`}
        >
          {t('brands')}
        </Link>
        <Link
          href="/annees"
          className={`transition-colors shrink-0 ${
            isNavActive('/annees') ? 'text-white font-semibold' : 'hover:text-white'
          }`}
        >
          {t('years')}
        </Link>
        <Link
          href="/technologies"
          className={`transition-colors shrink-0 ${
            isNavActive('/technologies') ? 'text-white font-semibold' : 'hover:text-white'
          }`}
        >
          {t('technologies')}
        </Link>
        <Link
          href="/comparaisons"
          className={`transition-colors shrink-0 ${
            isNavActive('/comparaisons') || isNavActive('/comparer') ? 'text-white font-semibold' : 'hover:text-white'
          }`}
        >
          {t('comparisons')}
        </Link>
        <Link
          href="/blog"
          className={`transition-colors shrink-0 ${
            isNavActive('/blog') ? 'text-white font-semibold' : 'hover:text-white'
          }`}
        >
          {t('blog')}
        </Link>
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <GlobalSearchModal models={models} brands={brands} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
