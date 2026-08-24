// Englobe TOUT /admin (dashboard ET /admin/login, qui n'a pas de layout dédié)
// pour garantir que le back-office reste en permanence sombre, quel que soit
// l'état du bouton de thème sur le site public — voir .force-dark dans
// app/globals.css.
import AdminImageUploadOptimizer from '@/components/admin/AdminImageUploadOptimizer';

export default function AdminRootLayout({ children }) {
  return (
    <div className="force-dark">
      <AdminImageUploadOptimizer />
      {children}
    </div>
  );
}
