// =============================================================================
// Admin Jobs Page — Manage Job Postings (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { jobAPI, companyAPI } from '@/lib/api';

interface Job {
  job_id: number;
  role: string;
  min_cgpa: number;
  salary: number;
  company_name: string;
  company_id: number;
  company_location: string;
}

interface Company {
  company_id: number;
  name: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: '#f2f3ff', border: '1.5px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#131b2e',
  outline: 'none', transition: 'all 0.15s', fontFamily: 'inherit',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.background = '#fff';
  e.target.style.borderColor = '#2563eb';
  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
};

const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.background = '#f2f3ff';
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
};

export default function AdminJobsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ company_id: '', role: '', min_cgpa: '', salary: '' });
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [jobsData, companiesData] = await Promise.all([jobAPI.getAll(), companyAPI.getAll()]);
      setJobs(jobsData); setCompanies(companiesData);
    } catch (err) { console.error('Failed to fetch data:', err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null);
    try {
      const payload = { company_id: parseInt(form.company_id), role: form.role, min_cgpa: parseFloat(form.min_cgpa), salary: parseFloat(form.salary) };
      if (editId) { await jobAPI.update(editId, payload); setMessage({ type: 'success', text: 'Job updated' }); }
      else { await jobAPI.create(payload); setMessage({ type: 'success', text: 'Job posted' }); }
      setForm({ company_id: '', role: '', min_cgpa: '', salary: '' }); setEditId(null); setShowForm(false); fetchData();
    } catch (err: unknown) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed' }); }
  };

  const handleEdit = (job: Job) => {
    setForm({ company_id: String(job.company_id), role: job.role, min_cgpa: String(job.min_cgpa), salary: String(job.salary) });
    setEditId(job.job_id); setShowForm(true);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job posting?')) return;
    try { await jobAPI.delete(id); setMessage({ type: 'success', text: 'Job deleted' }); fetchData(); }
    catch (err: unknown) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' }); }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dae2fd', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: '14px 24px', textAlign: 'left',
    fontSize: '10px', fontWeight: 700, color: '#434655',
    textTransform: 'uppercase', letterSpacing: '0.1em',
  };

  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase();
    return (
      (j.role && j.role.toLowerCase().includes(q)) ||
      (j.company_name && j.company_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            Job Postings
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>Manage active job listings</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '18px', color: '#737686',
            }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
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

          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ company_id: '', role: '', min_cgpa: '', salary: '' }); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', fontWeight: '700', fontSize: '14px',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Post Job
          </button>
        </div>
      </div>

      {/* Status Message */}
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

      {/* Jobs Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Min CGPA</th>
                <th style={thStyle}>Package</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.job_id}
                  style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#131b2e' }}>{job.company_name}</p>
                    <p style={{ fontSize: '11px', color: '#737686', marginTop: '2px' }}>{job.company_location}</p>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655', fontWeight: '500' }}>{job.role}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 10px', background: '#f2f3ff', borderRadius: '9999px',
                      fontSize: '13px', fontWeight: '700', color: '#434655',
                    }}>
                      {job.min_cgpa}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#16a34a', fontWeight: '700' }}>
                    ₹{(job.salary / 100000).toFixed(1)}L
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(job)} style={{
                      padding: '6px 14px', marginRight: '6px',
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(job.job_id)} style={{
                      padding: '6px 14px',
                      background: '#fee2e2', color: '#7f1d1d', border: '1px solid #fca5a5',
                      borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredJobs.length === 0 && jobs.length > 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>
              No jobs match your search.
            </div>
          )}
          {jobs.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>work</span>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#131b2e' }}>No jobs posted yet</p>
              <p style={{ color: '#737686', fontSize: '13px', marginTop: '4px' }}>Use the button above to post the first job.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {editId ? 'Edit Job' : 'Post New Job'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm({ company_id: '', role: '', min_cgpa: '', salary: '' }); }}
              style={{ background: 'none', border: 'none', color: '#737686', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Company</label>
                <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required style={inputStyle} onFocus={focusInput} onBlur={blurInput}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Job Role</label>
                <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. SDE-1" required style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Min CGPA</label>
                <input type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} placeholder="e.g. 7.5" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Annual Salary (₹)</label>
                <input type="number" step="1000" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 1200000" required style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
            </div>
            <button type="submit" style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', fontWeight: '700', fontSize: '14px',
              border: 'none', borderRadius: '9px', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            }}>
              {editId ? 'Update Job' : 'Post Job'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
