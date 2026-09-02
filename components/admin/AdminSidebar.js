'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/admin/actions';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', exact: true, icon: '📊' },
    { href: '/admin/brands', label: 'Marques', icon: '🏷️' },
    { href: '/admin/earbuds', label: 'Écouteurs', icon: '🎧' },
    { href: '/admin/articles', label: 'Articles', icon: '📰' },
    { href: '/admin/guides', label: 'Guides', icon: '🧭' },
    { href: '/admin/newsletter', label: 'Newsletter', icon: '📬' },
  ];

  return (
    <aside className="sm:w-60 border-b sm:border-b-0 sm:border-r border-line p-5 flex sm:flex-col gap-4 sm:gap-0 bg-panel/30">
      <div className="sm:mb-8 flex items-center justify-between">
        <Link href="/admin" className="font-display font-bold text-base leading-tight">
          EarbudsTimeline
          <span className="text-accent text-xs font-body block mt-0.5 font-normal">Back-office</span>
        </Link>
      </div>

      <nav className="flex sm:flex-col gap-1.5 text-sm flex-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all text-xs font-medium ${
                isActive
                  ? 'bg-accent/15 border border-accent/40 text-accent font-semibold'
                  : 'text-dim hover:bg-panel hover:text-white border border-transparent'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-line/40 sm:flex flex-col gap-1 hidden">
          <a
            href="/fr"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg flex items-center justify-between text-xs text-dim hover:text-white hover:bg-panel transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              <span>Voir le site</span>
            </span>
            <span className="text-[10px] text-accent">↗</span>
          </a>
        </div>
      </nav>

      <form action={logout} className="sm:mt-auto pt-4 border-t border-line/40">
        <button
          type="submit"
          className="text-xs text-dim hover:text-rose-400 text-left transition-colors flex items-center gap-2 w-full py-1"
        >
          <span>🚪</span>
          <span>Se déconnecter</span>
        </button>
      </form>
    </aside>
  );
}
