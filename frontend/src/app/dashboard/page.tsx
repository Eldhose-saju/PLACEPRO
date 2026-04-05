// =============================================================================
// Student Dashboard — Profile, Stats & Applications (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { applicationAPI, studentAPI } from '@/lib/api';
import StatsCard from '@/components/StatsCard';

interface Application {
  application_id: number;
  status: string;
  applied_at: string;
  job_role: string;
  salary: number;
  company_name: string;
  company_location: string;
}

interface StudentProfile {
  student_id: number;
  name: string;
  email: string;
  phone: string;
  cgpa: number;
  skills: string;
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: '#f2f3ff', border: '1.5px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#131b2e',
  outline: 'none', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', cgpa: '', skills: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch independently so a profile 403 doesn't blank out applications
      const appsPromise = applicationAPI.getAll().catch(err => {
        console.error('Failed to fetch applications:', err);
        return [];
      });
      const profilePromise = studentAPI.getProfile().catch(err => {
        console.error('Failed to fetch profile:', err);
        return null;
      });

      const [apps, prof] = await Promise.all([appsPromise, profilePromise]);
      setApplications(apps || []);
      if (prof) setProfile(prof);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phone: profile.phone,
        cgpa: String(profile.cgpa),
        skills: profile.skills || '',
      });
      setEditing(true);
      setMessage(null);
    }
  };

  const handleEditCancel = () => { setEditing(false); setMessage(null); };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      await studentAPI.update(profile.student_id, {
        name: editForm.name,
        phone: editForm.phone,
        cgpa: parseFloat(editForm.cgpa),
        skills: editForm.skills,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditing(false);
      const updatedProfile = await studentAPI.getProfile();
      setProfile(updatedProfile);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #dae2fd',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const selectedCount = applications.filter(a => a.status === 'selected').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const pendingCount = applications.filter(a => a.status === 'applied').length;

  const statusColors: Record<string, { bg: string; text: string }> = {
    applied: { bg: '#fef3c7', text: '#92400e' },
    shortlisted: { bg: '#dbeafe', text: '#1e3a8a' },
    selected: { bg: '#dcfce7', text: '#14532d' },
    rejected: { bg: '#fee2e2', text: '#7f1d1d' },
  };

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
            Welcome back, <span style={{ color: '#2563eb' }}>{profile?.name?.split(' ')[0] || 'Student'}</span>
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Track your placement journey
          </p>
        </div>
        <Link
          href="/jobs"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #2563eb, #004ac6)',
            color: 'white', fontWeight: '700', fontSize: '14px',
            borderRadius: '10px', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>work_outline</span>
          Browse Jobs
        </Link>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{
          marginBottom: '24px', padding: '14px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '500',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#14532d' : '#7f1d1d',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatsCard title="Total Applied" value={applications.length} icon="description" color="blue" />
        <StatsCard title="Selected" value={selectedCount} icon="emoji_events" color="emerald" />
        <StatsCard title="Shortlisted" value={shortlistedCount} icon="verified" color="sky" />
        <StatsCard title="Pending" value={pendingCount} icon="pending" color="amber" />
      </div>

      {/* Split: Profile + Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Profile Card */}
        {profile && !editing && (
          <div style={{
            background: '#ffffff', borderRadius: '12px',
            padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #004ac6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '20px', fontWeight: '800',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {profile.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e' }}>{profile.name}</h2>
                <p style={{ color: '#737686', fontSize: '13px', marginTop: '2px' }}>{profile.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginRight: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>CGPA</span>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.cgpa}</p>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>Phone</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#131b2e' }}>{profile.phone}</p>
                </div>
              </div>
              <button
                onClick={handleEditClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: '8px', color: '#1d4ed8', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                Edit Profile
              </button>
            </div>
            {profile.skills && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skills.split(',').map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    background: '#f2f3ff', border: '1px solid #e2e8f0',
                    borderRadius: '9999px', fontSize: '12px',
                    color: '#434655', fontWeight: '500',
                  }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline Edit Form */}
        {editing && (
          <form onSubmit={handleEditSave} style={{
            background: '#ffffff', borderRadius: '12px',
            padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Profile</h3>
              <button type="button" onClick={handleEditCancel} style={{ background: 'none', border: 'none', color: '#737686', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Full Name', field: 'name', type: 'text' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'CGPA', field: 'cgpa', type: 'number' },
                { label: 'Skills (comma separated)', field: 'skills', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>{label}</label>
                  <input
                    type={type}
                    step={field === 'cgpa' ? '0.1' : undefined}
                    value={(editForm as Record<string, string>)[field]}
                    onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.background = '#f2f3ff'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', fontWeight: '700', fontSize: '13px',
              border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Applications Table */}
        <div style={{
          background: '#ffffff', borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Your Applications
            </h3>
          </div>

          {applications.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>description</span>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#131b2e' }}>No applications yet</p>
              <p style={{ color: '#737686', fontSize: '13px', marginTop: '4px' }}>Start by browsing available jobs</p>
              <Link href="/jobs" style={{
                display: 'inline-block', marginTop: '20px',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #2563eb, #004ac6)',
                color: 'white', fontWeight: '700', fontSize: '14px',
                borderRadius: '10px', textDecoration: 'none',
              }}>
                View Jobs
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Company', 'Role', 'Package', 'Status', 'Applied On'].map(h => (
                      <th key={h} style={{
                        padding: '14px 24px', textAlign: 'left',
                        fontSize: '10px', fontWeight: '700', color: '#434655',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.application_id}
                      style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', color: '#1d4ed8',
                          }}>
                            {(app.company_name || '?').charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#131b2e' }}>{app.company_name}</p>
                            <p style={{ fontSize: '11px', color: '#737686' }}>{app.company_location}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655', fontWeight: '500' }}>{app.job_role}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#2563eb', fontWeight: '700' }}>₹{(app.salary / 100000).toFixed(1)}L</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '9999px',
                          fontSize: '10px', fontWeight: '700', textTransform: 'capitalize',
                          background: statusColors[app.status]?.bg || '#f1f5f9',
                          color: statusColors[app.status]?.text || '#475569',
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#737686' }}>
                        {new Date(app.applied_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
