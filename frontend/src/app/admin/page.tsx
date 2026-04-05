// =============================================================================
// Admin Dashboard — Overview with Statistics, Audit Log, and Reports
// Updated to design.html theme
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { reportAPI } from '@/lib/api';
import StatsCard from '@/components/StatsCard';

interface Statistics {
  total_students: number;
  total_companies: number;
  total_jobs: number;
  total_applications: number;
  placed_students: number;
  avg_salary: number;
  max_salary: number;
  min_salary: number;
  applications_per_company: { company_name: string; total_applications: number }[];
  status_distribution: { status: string; count: number }[];
  company_stats: {
    company_name: string;
    location: string;
    total_jobs: number;
    total_applications: number;
    students_hired: number;
    avg_salary_offered: number;
    max_salary: number;
    min_salary: number;
  }[];
}

interface Placement {
  student_name: string;
  company_name: string;
  job_role: string;
  salary: number;
  student_email: string;
}

interface AuditLog {
  log_id: number;
  application_id: number;
  action: string;
  old_status: string | null;
  new_status: string;
  logged_at: string;
  student_name: string;
  job_role: string;
  company_name: string;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
  const [placementSearch, setPlacementSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [statsData, placementsData, auditData] = await Promise.all([
        reportAPI.getStatistics(),
        reportAPI.getPlacements(),
        reportAPI.getAuditLog(),
      ]);
      setStats(statsData);
      setPlacements(placementsData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #dae2fd', borderTopColor: '#2563eb',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const statusBarColors: Record<string, string> = {
    applied: '#f59e0b',
    shortlisted: '#0ea5e9',
    selected: '#10b981',
    rejected: '#ef4444',
  };

  const thStyle = {
    padding: '14px 24px', textAlign: 'left' as const,
    fontSize: '10px', fontWeight: '700' as const, color: '#434655',
    textTransform: 'uppercase' as const, letterSpacing: '0.1em',
  };

  const filteredPlacements = placements.filter(p => {
    const q = placementSearch.toLowerCase();
    return (
      (p.student_name && p.student_name.toLowerCase().includes(q)) ||
      (p.company_name && p.company_name.toLowerCase().includes(q)) ||
      (p.job_role && p.job_role.toLowerCase().includes(q))
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const q = auditSearch.toLowerCase();
    return (
      (log.student_name && log.student_name.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.job_role && log.job_role.toLowerCase().includes(q)) ||
      (log.company_name && log.company_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h3 style={{
            fontSize: '28px', fontWeight: '800',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#131b2e', letterSpacing: '-0.02em',
          }}>
            Overview
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Placement cycle management &amp; analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/admin/companies"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: '#e2e7ff', color: '#394c84',
              borderRadius: '10px', textDecoration: 'none',
              fontWeight: '700', fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'background 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>business</span>
            Companies
          </Link>
          <Link
            href="/admin/jobs"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', borderRadius: '10px', textDecoration: 'none',
              fontWeight: '700', fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>work</span>
            Post Job
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatsCard title="Total Students" value={stats?.total_students || 0} icon="groups" color="blue" badge="+active" />
        <StatsCard title="Companies" value={stats?.total_companies || 0} icon="apartment" color="purple" />
        <StatsCard title="Placed Students" value={stats?.placed_students || 0} icon="emoji_events" color="amber" />
        <StatsCard title="Avg Package" value={`₹${((stats?.avg_salary || 0) / 100000).toFixed(1)}L`} icon="payments" color="emerald" />
        <StatsCard title="Highest Offer" value={`₹${((stats?.max_salary || 0) / 100000).toFixed(1)}L`} icon="trending_up" color="sky" />
        <StatsCard title="Total Applications" value={stats?.total_applications || 0} icon="description" color="indigo" />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f2f3ff', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {[
          { key: 'overview', label: 'Reports & Statistics' },
          { key: 'audit', label: 'Audit Log' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'audit')}
            style={{
              padding: '8px 20px', borderRadius: '7px', border: 'none',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s ease',
              background: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#131b2e' : '#737686',
              boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Status Distribution */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '20px' }}>
                Application Status Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats?.status_distribution.map((item) => {
                  const total = stats.total_applications || 1;
                  const percentage = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#131b2e', fontWeight: '600', textTransform: 'capitalize' }}>{item.status}</span>
                        <span style={{ fontSize: '12px', color: '#737686' }}>{item.count} ({percentage}%)</span>
                      </div>
                      <div style={{ background: '#f2f3ff', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          background: statusBarColors[item.status] || '#2563eb',
                          height: '100%', borderRadius: '9999px',
                          width: `${percentage}%`, transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Company Partners */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Top Partners
                </h3>
                <span style={{ fontSize: '10px', color: '#737686', background: '#f2f3ff', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  company_stats_view
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '260px', overflowY: 'auto' }}>
                {stats?.company_stats.filter(c => c.total_applications > 0).slice(0, 8).map((item) => (
                  <div key={item.company_name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', background: '#f8fafc', borderRadius: '8px',
                    transition: 'background 0.15s', cursor: 'default',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f3ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#131b2e' }}>{item.company_name}</p>
                      <p style={{ fontSize: '11px', color: '#737686', marginTop: '2px' }}>
                        {item.total_jobs} jobs · {item.students_hired} placed
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>{item.total_applications}</p>
                      <p style={{ fontSize: '10px', color: '#737686', fontWeight: '600', marginTop: '2px' }}>
                        Avg ₹{(item.avg_salary_offered / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Placements Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Recent Placements
                </h3>
                <span style={{ fontSize: '10px', color: '#737686', background: '#f2f3ff', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  placed_students_view
                </span>
              </div>
              
              <div style={{ position: 'relative', width: '250px' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', color: '#737686',
                }}>search</span>
                <input
                  type="text"
                  value={placementSearch}
                  onChange={(e) => setPlacementSearch(e.target.value)}
                  placeholder="Search student, company, role..."
                  style={{
                    width: '100%', padding: '8px 16px 8px 36px',
                    background: '#f8fafc', border: '1.5px solid transparent',
                    borderRadius: '8px', fontSize: '13px', color: '#131b2e',
                    outline: 'none', transition: 'all 0.15s ease', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Student', 'Company', 'Role', 'Package'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlacements.map((p, idx) => (
                    <tr key={idx}
                      style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', color: '#1d4ed8',
                          }}>
                            {p.student_name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#131b2e' }}>{p.student_name}</p>
                            <p style={{ fontSize: '11px', color: '#737686' }}>{p.student_email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655', fontWeight: '500' }}>{p.company_name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655' }}>{p.job_role}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#16a34a', fontWeight: '700' }}>₹{(p.salary / 100000).toFixed(1)}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPlacements.length === 0 && placements.length > 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>No placements match your search.</div>
              )}
              {placements.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>No placements recorded yet.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Audit Log Tab */
        <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                System Audit Log
              </h3>
              <p style={{ fontSize: '12px', color: '#737686', marginTop: '4px' }}>Auto-generated by database triggers on every status change.</p>
            </div>
            {auditLogs.length > 0 && (
              <div style={{ position: 'relative', width: '250px' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', color: '#737686',
                }}>search</span>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search logs..."
                  style={{
                    width: '100%', padding: '8px 16px 8px 36px',
                    background: '#f8fafc', border: '1.5px solid transparent',
                    borderRadius: '8px', fontSize: '13px', color: '#131b2e',
                    outline: 'none', transition: 'all 0.15s ease', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}
          </div>
          {auditLogs.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>receipt_long</span>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#131b2e' }}>No Activity Logged</p>
              <p style={{ color: '#737686', fontSize: '13px', marginTop: '4px' }}>The system will begin recording once data is populated.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['ID', 'Event', 'Student', 'Target', 'Change', 'Time'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.log_id}
                      style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 24px', fontSize: '12px', color: '#737686', fontFamily: 'monospace' }}>#{String(log.log_id).padStart(5, '0')}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '9999px',
                          fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase',
                          background: log.action === 'INSERT' ? '#dbe1ff' : '#fef3c7',
                          color: log.action === 'INSERT' ? '#00174b' : '#92400e',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '600', color: '#131b2e' }}>{log.student_name || '—'}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <p style={{ fontSize: '13px', color: '#434655', fontWeight: '500' }}>{log.job_role || '—'}</p>
                        {log.company_name && <p style={{ fontSize: '11px', color: '#737686', marginTop: '2px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{log.company_name}</p>}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        {log.action === 'STATUS_UPDATE' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', color: '#434655', textTransform: 'capitalize' }}>{log.old_status}</span>
                            <span style={{ color: '#c3c6d7' }}>→</span>
                            <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', color: '#2563eb', textTransform: 'capitalize', fontWeight: '600' }}>{log.new_status}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#131b2e', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', textTransform: 'capitalize' }}>{log.new_status}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '12px', color: '#737686', whiteSpace: 'nowrap' }}>
                        {new Date(log.logged_at).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAuditLogs.length === 0 && auditLogs.length > 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>No logs match your search.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
