// Master layout wrapper for administrator dashboard with responsive sidebar and header
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ToastContainer from '../../components/common/ToastContainer';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLayout() {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-rawaa-bg text-rawaa-dark font-sans antialiased selection:bg-rawaa-primary selection:text-white flex overflow-x-hidden">
      {/* Administrative navigation sidebar */}
      <AdminSidebar />

      {/* Main dashboard body */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'
        }`}
      >
        {/* Top administrative bar */}
        <AdminHeader />

        {/* Dynamic page content */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Admin copyright footer */}
        <footer className="border-t border-rawaa-border/60 py-4 px-6 text-center text-xs text-rawaa-muted">
          <span>لوحة إدارة متجر <strong>بيبي زون (Baby Zone)</strong> © 2026 — برمجة وتطوير <strong>Eslam Gamil</strong></span>
        </footer>
      </div>

      {/* Floating glassmorphic toast notification stack */}
      <ToastContainer />
    </div>
  );
}
