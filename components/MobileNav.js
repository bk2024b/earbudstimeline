'use client';

import { useEffect, useState, memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Menu,
  X,
  Sparkles,
  Layers,
  Clock,
  BarChart3,
  Calendar,
  Cpu,
  Swords,
  BookOpen,
  Compass,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

function MobileNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isNavActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      href: '/trouver-mes-ecouteurs',
      label: t('finder') || 'Trouver mes écouteurs',
      icon: Sparkles,
      highlight: true,
      badge: 'IA & Budget',
    },
    {
      href: '/marques',
      label: t('brands') || 'Marques',
      icon: Layers,
    },
    {
      href: '/ecouteurs',
      label: t('explore') || 'Explorer',
      icon: Compass,
    },
    {
      href: '/timeline',
      label: 'Timeline Historique',
      icon: Clock,
    },
    {
      href: '/insights',
      label: t('insights') || 'Insights',
      icon: BarChart3,
    },
    {
      href: '/annees',
      label: t('years') || 'Par année',
      icon: Calendar,
    },
    {
      href: '/technologies',
      label: t('technologies') || 'Technologies',
      icon: Cpu,
    },
    {
      href: '/comparaisons',
      label: t('comparisons') || 'Comparateur & Duels',
      icon: Swords,
    },
    {
      href: '/guides/best-budget-earbuds',
      label: locale === 'en' ? 'Budget Buying Guide' : 'Guide d’achat Budget',
      icon: Search,
    },
    {
      href: '/blog',
      label: t('blog') || 'Blog & Articles',
      icon: BookOpen,
    },
  ];

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll de l'arrière-plan quand le menu est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Bouton Hamburger dans le Header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu') || 'Ouvrir le menu'}
        aria-expanded={open}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-line bg-panel2 text-dim hover:text-accent hover:border-accent transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Tiroir plein écran */}
      {open && (
        <div className="fixed inset-0 z-50 bg-page flex flex-col animate-fadeIn">
          {/* En-tête du menu mobile */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/50 bg-panel/80 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold text-lg text-fg">EarbudsTimeline</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('closeMenu') || 'Fermer le menu'}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-line bg-panel2 text-dim hover:text-accent hover:border-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des liens du menu */}
          <nav className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.href);

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-2xl p-4 bg-accent/10 border border-accent/40 text-accent font-semibold mb-2 shadow-sm transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent text-ink flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-base text-accent font-bold">{item.label}</div>
                        <div className="text-xs text-dim opacity-80">{item.badge}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-70" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-panel2 border border-accent/40 text-accent font-semibold'
                      : 'text-fg hover:bg-panel border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'text-dim'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dim/50" />
                </Link>
              );
            })}
          </nav>

          {/* Barre inférieure avec réglages de langue et thème */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-line/50 bg-panel/90 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="text-xs text-dim">Thème :</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dim">Langue :</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MobileNav);
