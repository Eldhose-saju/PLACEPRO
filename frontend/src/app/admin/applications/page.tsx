// =============================================================================
// Admin Applications Page — Review & Update Status (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { applicationAPI } from '@/lib/api';

interface Application {
  application_id: number;
  status: string;
  applied_at: string;
  student_id: number;
  student_name: string;
  student_email: string;
  cgpa: number;
  job_id: number;
  job_role: string;
  salary: number;
  company_name: string;
  company_location: string;
}

export default function AdminApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
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

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setUpdating(id);
    setMessage(null);
    try {
      await applicationAPI.updateStatus(id, newStatus);
      setMessage({ type: 'success', text: `Status updated to ${newStatus}` });
      fetchApplications();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setUpdating(null);
    }
  };

  const filteredApps = applications.filter(a => {
    const statusMatch = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const searchMatch = !q || (
      (a.student_name && a.student_name.toLowerCase().includes(q)) ||
      (a.company_name && a.company_name.toLowerCase().includes(q)) ||
      (a.job_role && a.job_role.toLowerCase().includes(q))
    );
    return statusMatch && searchMatch;
  });

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dae2fd', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    applied: { bg: '#fef3c7', text: '#92400e' },
    shortlisted: { bg: '#dbeafe', text: '#1e3a8a' },
    selected: { bg: '#dcfce7', text: '#14532d' },
    rejected: { bg: '#fee2e2', text: '#7f1d1d' },
  };

  const avatarColors = ['#eff6ff', '#f5f3ff', '#fef3c7', '#fee2e2', '#dcfce7', '#e0f2fe'];
  const avatarTextColors = ['#1d4ed8', '#6d28d9', '#92400e', '#7f1d1d', '#14532d', '#0369a1'];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            Applications
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Review and manage student applications
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
            placeholder="Search student, company, or role..."
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

      {/* Success/Error Message */}
      {message && (
        <div style={{
          marginBottom: '20px', padding: '14px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '500',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#14532d' : '#7f1d1d',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '7px 16px', borderRadius: '8px', border: '1.5px solid',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s',
              textTransform: 'capitalize',
              background: filter === status ? '#eff6ff' : '#ffffff',
              color: filter === status ? '#1d4ed8' : '#64748b',
              borderColor: filter === status ? '#bfdbfe' : '#e2e8f0',
            }}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span style={{ marginLeft: '6px', opacity: 0.7, fontSize: '11px' }}>
              ({status === 'all' ? applications.length : applications.filter(a => a.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredApps.map((app, idx) => {
          const colorIdx = idx % avatarColors.length;
          return (
            <div
              key={app.application_id}
              style={{
                background: '#ffffff', borderRadius: '12px',
                padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.09)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                {/* Student + Job Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{
                    width: '44px', height: '44px', minWidth: '44px', borderRadius: '10px',
                    background: avatarColors[colorIdx],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '800', color: avatarTextColors[colorIdx],
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {app.student_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {app.student_name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#737686', marginTop: '2px' }}>
                      {app.student_email}
                      <span style={{ margin: '0 6px', color: '#c3c6d7' }}>·</span>
                      <span style={{ color: '#434655', fontWeight: '600' }}>CGPA: {app.cgpa}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', background: '#f2f3ff', borderRadius: '6px', fontSize: '12px', color: '#434655' }}>
                        <span style={{ color: '#737686' }}>Role:</span> {app.job_role}
                      </span>
                      <span style={{ padding: '3px 10px', background: '#f2f3ff', borderRadius: '6px', fontSize: '12px', color: '#434655' }}>
                        <span style={{ color: '#737686' }}>Company:</span> {app.company_name}
                      </span>
                      <span style={{ padding: '3px 10px', background: '#dcfce7', borderRadius: '6px', fontSize: '12px', color: '#14532d', fontWeight: '700' }}>
                        ₹{(app.salary / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '220px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: statusColors[app.status]?.bg || '#f1f5f9',
                    color: statusColors[app.status]?.text || '#475569',
                  }}>
                    {app.status}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {app.status !== 'shortlisted' && (
                      <button
                        onClick={() => handleStatusUpdate(app.application_id, 'shortlisted')}
                        disabled={updating === app.application_id}
                        style={{
                          padding: '6px 12px', fontSize: '12px', fontWeight: '700',
                          background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                          borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          opacity: updating === app.application_id ? 0.5 : 1,
                        }}
                      >
                        Shortlist
                      </button>
                    )}
                    {app.status !== 'selected' && (
                      <button
                        onClick={() => handleStatusUpdate(app.application_id, 'selected')}
                        disabled={updating === app.application_id}
                        style={{
                          padding: '6px 12px', fontSize: '12px', fontWeight: '700',
                          background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0',
                          borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          opacity: updating === app.application_id ? 0.5 : 1,
                        }}
                      >
                        Select
                      </button>
                    )}
                    {app.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(app.application_id, 'rejected')}
                        disabled={updating === app.application_id}
                        style={{
                          padding: '6px 12px', fontSize: '12px', fontWeight: '700',
                          background: '#fee2e2', color: '#7f1d1d', border: '1px solid #fca5a5',
                          borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          opacity: updating === app.application_id ? 0.5 : 1,
                        }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>filter_list_off</span>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#131b2e' }}>No applications found</p>
          <p style={{ color: '#737686', fontSize: '13px', marginTop: '4px' }}>Try changing the filter to see other statuses</p>
        </div>
      )}
    </div>
  );
}
