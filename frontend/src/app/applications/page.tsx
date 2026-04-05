// =============================================================================
// My Applications Page — Student (design.html theme)
// API returns flat fields: company_name, job_role, salary directly on each object
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { applicationAPI } from '@/lib/api';

// API returns flat structure - all fields at top level
interface Application {
  application_id: number;
  status: string;
  applied_at: string;
  // Flat fields from JOIN (not nested)
  company_name: string;
  company_location: string;
  job_role: string;
  salary: number;
  student_name: string;
  student_email: string;
  cgpa: number;
}

export default function StudentApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) { router.push('/login'); return; }
    if (user) fetchApplications();
  }, [user, authLoading]);

  const fetchApplications = async () => {
    try {
      const data = await applicationAPI.getAll();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dae2fd', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    applied:     { bg: '#fef3c7', text: '#92400e' },
    shortlisted: { bg: '#dbeafe', text: '#1e3a8a' },
    selected:    { bg: '#dcfce7', text: '#14532d' },
    rejected:    { bg: '#fee2e2', text: '#7f1d1d' },
  };

  const thStyle = {
    padding: '14px 24px', textAlign: 'left' as const,
    fontSize: '10px', fontWeight: '700' as const, color: '#434655',
    textTransform: 'uppercase' as const, letterSpacing: '0.1em',
  };

  const filteredApps = applications.filter(app => {
    const q = search.toLowerCase();
    return (
      (app.company_name && app.company_name.toLowerCase().includes(q)) ||
      (app.job_role && app.job_role.toLowerCase().includes(q)) ||
      (app.status && app.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            My Applications
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Track the status of your placement submissions
          </p>
        </div>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '18px', color: '#737686',
          }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role or status..."
            style={{
              width: '100%', padding: '10px 16px 10px 40px',
              background: '#f2f3ff', border: '1.5px solid transparent',
              borderRadius: '10px', fontSize: '14px', color: '#131b2e',
              outline: 'none', transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
            onBlur={(e) => { e.target.style.background = '#f2f3ff'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {applications.length === 0 ? (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '80px 24px',
          textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#c3c6d7', display: 'block', marginBottom: '16px' }}>description</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#131b2e' }}>No Applications Yet</h3>
          <p style={{ color: '#737686', marginTop: '6px', marginBottom: '24px', fontSize: '14px' }}>
            Discover exciting opportunities on the Job Board!
          </p>
          <button
            onClick={() => router.push('/jobs')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', fontWeight: '700', fontSize: '14px',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            Explore Jobs
          </button>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Company', 'Role', 'Package', 'Status', 'Applied On'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr
                    key={app.application_id}
                    style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '800', color: '#1d4ed8',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          {(app.company_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#131b2e' }}>
                            {app.company_name || 'Unknown'}
                          </p>
                          {app.company_location && (
                            <p style={{ fontSize: '11px', color: '#737686' }}>{app.company_location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655', fontWeight: '500' }}>
                      {app.job_role || '—'}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#2563eb', fontWeight: '700' }}>
                      {app.salary ? `₹${(app.salary / 100000).toFixed(1)}L` : '—'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '9999px',
                        fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: statusColors[app.status]?.bg || '#f1f5f9',
                        color: statusColors[app.status]?.text || '#475569',
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#737686' }}>
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApps.length === 0 && applications.length > 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>
                No applications match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
