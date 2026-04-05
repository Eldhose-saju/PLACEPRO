'use client';

// =============================================================================
// PortalShell — Wraps the app with Sidebar + TopBar for auth'd pages
// On login/register, shows a plain centered layout (no sidebar)
// =============================================================================

import { useAuth } from '@/lib/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AUTH_PATHS = ['/login', '/register'];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.includes(pathname);

  // On auth pages or when unauthenticated → just render page centered
  if (isAuthPage || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#faf8ff' }}>
        {children}
      </div>
    );
  }

  // Get page title from path
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname === '/admin/companies') return 'Companies';
    if (pathname === '/admin/jobs') return 'Job Postings';
    if (pathname === '/admin/applications') return 'Applications';
    if (pathname === '/dashboard') return 'My Dashboard';
    if (pathname === '/jobs') return 'Job Board';
    if (pathname === '/applications') return 'My Applications';
    if (pathname === '/profile') return 'Profile';
    return 'Placement Portal';
  };

  return (
    <div style={{ background: '#faf8ff', minHeight: '100vh' }}>
      <Sidebar />
      <main className="portal-main">
        <TopBar pageTitle={getPageTitle()} />
        <div className="portal-content">
          {children}
        </div>
      </main>
    </div>
  );
}
