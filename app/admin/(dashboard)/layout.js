import Link from 'next/link';
import { logout } from '../actions';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="sm:w-56 border-b sm:border-b-0 sm:border-r border-line p-5 flex sm:flex-col gap-4 sm:gap-0">
        <Link href="/admin" className="font-display font-bold text-base leading-tight sm:mb-8">
          EarbudsTimeline
          <span className="text-dim text-xs font-body block mt-0.5">Admin</span>
        </Link>
        <nav className="flex sm:flex-col gap-1 text-sm text-dim flex-1">
          <Link href="/admin/brands" className="px-3 py-2 rounded-lg hover:bg-panel hover:text-white transition-colors">
            Marques
          </Link>
          <Link href="/admin/earbuds" className="px-3 py-2 rounded-lg hover:bg-panel hover:text-white transition-colors">
            Écouteurs
          </Link>
          <Link href="/admin/articles" className="px-3 py-2 rounded-lg hover:bg-panel hover:text-white transition-colors">
            Articles
          </Link>
        </nav>
        <form action={logout} className="sm:mt-auto">
          <button type="submit" className="text-xs text-dim hover:text-white text-left transition-colors">
            Se déconnecter
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 sm:p-8 max-w-4xl">{children}</main>
    </div>
  );
}
