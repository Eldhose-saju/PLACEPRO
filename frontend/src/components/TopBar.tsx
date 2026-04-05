'use client';

// =============================================================================
// TopBar — Sticky header with page title and user info
// Matches design.html header exactly
// =============================================================================

import { useAuth } from '@/lib/AuthContext';

interface TopBarProps {
  pageTitle: string;
}

export default function TopBar({ pageTitle }: TopBarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.email.charAt(0).toUpperCase();
  const displayRole = user.role === 'admin' ? 'Administrator' : 'Student';

  return (
    <header className="portal-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '17px',
          fontWeight: '700',
          color: '#1d4ed8',
          whiteSpace: 'nowrap',
        }}>
          {pageTitle}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification Bell */}
        <button style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          borderRadius: '50%',
          color: '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: '#e2e8f0', margin: '0 8px' }} />

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', lineHeight: 1 }}>
              {user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
              {displayRole}
            </p>
          </div>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #004ac6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '800',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
