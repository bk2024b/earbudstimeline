'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, Sparkles } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

const LINKS = [
  { href: '/#marques', key: 'brands' },
  { href: '/annees', key: 'years' },
  { href: '/technologies', key: 'technologies' },
  { href: '/comparaisons', key: 'comparisons' },
  { href: '/blog', key: 'blog' },
];

export default function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Ferme le menu à chaque changement de page (clic sur un lien, retour navigateur…)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll de la page derrière le panneau plein écran quand il est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
        aria-expanded={open}
        className="w-11 h-11 flex items-center justify-center rounded-full border border-line text-dim hover:text-accent hover:border-accent transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-page flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/40">
            <span className="font-display font-bold text-lg">EarbudsTimeline</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('closeMenu')}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-line text-dim hover:text-accent hover:border-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-5 overflow-y-auto">
            <Link
              href="/trouver-mes-ecouteurs"
              className="flex items-center gap-2 rounded-xl px-4 py-3.5 bg-accent/10 border border-accent/30 text-accent font-semibold mb-3"
            >
              <Sparkles className="w-4 h-4" />
              {t('finder')}
            </Link>
            {LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="rounded-xl px-4 py-3.5 text-fg font-medium hover:bg-panel transition-colors"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center justify-between gap-3 px-5 py-4 border-t border-line/40">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}
