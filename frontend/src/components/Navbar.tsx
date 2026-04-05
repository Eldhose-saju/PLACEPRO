// =============================================================================
// Navbar Component — Top Navigation Bar (Clean, No Glass Effects)
// =============================================================================

'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on login/register pages
  if (!user) return null;

  const adminLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Companies', href: '/admin/companies' },
    { name: 'Jobs', href: '/admin/jobs' },
    { name: 'Applications', href: '/admin/applications' }
  ];

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Job Board', href: '/jobs' },
    { name: 'My Applications', href: '/applications' },
    { name: 'Profile', href: '/profile' }
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 shadow-sm">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo & Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#004ac6] flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm tracking-tight">CP</span>
            </div>
            <span className="text-[#191c1e] font-extrabold text-lg tracking-tight hidden sm:inline">PlaceMe</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-[#2563eb]'
                      : 'text-[#737686] hover:bg-gray-100 hover:text-[#191c1e]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-[#191c1e] truncate max-w-[180px]">{user.email}</span>
            <span className="text-[10px] text-[#2563eb] uppercase tracking-wider font-bold">{user.role}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-[#191c1e] bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
