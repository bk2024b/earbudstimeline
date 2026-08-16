'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const t = useTranslations('nav');

  return (
    <header className="flex items-center justify-between py-5 mb-8 sticky top-0 bg-ink/90 backdrop-blur z-20 gap-4">
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <Image src="/logo-icon.png" alt="" width={28} height={28} priority />
        <span className="font-display font-bold text-lg">EarbudsTimeline</span>
      </Link>

      <nav className="flex items-center gap-4 sm:gap-6 text-sm text-dim overflow-x-auto py-1">
        <Link
          href="/trouver-mes-ecouteurs"
          className="text-accent hover:text-white transition-colors font-medium flex items-center gap-1.5 bg-accent/10 border border-accent/30 rounded-full px-3 py-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('finder')}</span>
        </Link>
        <Link href="/#marques" className="hover:text-white transition-colors shrink-0">
          {t('brands')}
        </Link>
        <Link href="/annees" className="hover:text-white transition-colors shrink-0">
          {t('years')}
        </Link>
        <Link href="/technologies" className="hover:text-white transition-colors shrink-0">
          {t('technologies')}
        </Link>
        <Link href="/comparaisons" className="hover:text-white transition-colors shrink-0">
          {t('comparisons')}
        </Link>
        <Link href="/blog" className="hover:text-white transition-colors shrink-0">
          {t('blog')}
        </Link>
      </nav>

      <div className="shrink-0">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
