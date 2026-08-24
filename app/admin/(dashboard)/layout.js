import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminImageUploadOptimizer from '@/components/admin/AdminImageUploadOptimizer';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 max-w-5xl overflow-x-hidden">
        <AdminImageUploadOptimizer />
        {children}
      </main>
    </div>
  );
}
