'use client';

// =============================================================================
// Sidebar — Fixed left nav with logo, navigation links, and user links
// Matches the design.html sidebar exactly
// =============================================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { name: 'Companies', href: '/admin/companies', icon: 'business' },
    { name: 'Jobs', href: '/admin/jobs', icon: 'work' },
    { name: 'Applications', href: '/admin/applications', icon: 'description' },
  ];

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Job Board', href: '/jobs', icon: 'work_outline' },
    { name: 'My Applications', href: '/applications', icon: 'description' },
    { name: 'Profile', href: '/profile', icon: 'person' },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="portal-sidebar">
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #004ac6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>school</span>
          </div>
          <div>
            <h1 style={{
              fontSize: '16px', fontWeight: '800', color: '#1e40af',
              fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1,
            }}>
              Placement Portal
            </h1>
            <p style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.1em', color: '#64748b', marginTop: '3px', textTransform: 'uppercase' }}>
              Institutional Suite
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.01em',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#475569',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#475569';
                  }
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom: User + Sign Out */}
      <div style={{ padding: '16px 12px 0' }}>
        {/* Role badge */}
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #004ac6, #2563eb)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 74, 198, 0.25)',
          marginBottom: '12px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user.role === 'admin' ? 'Admin' : 'Student'}
          </p>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2';
            (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
