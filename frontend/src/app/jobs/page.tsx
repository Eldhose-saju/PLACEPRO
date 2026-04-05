// =============================================================================
// Jobs Page — Browse Available Job Postings (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { jobAPI, applicationAPI } from '@/lib/api';

interface Job {
  job_id: number;
  role: string;
  min_cgpa: number;
  salary: number;
  company_name: string;
  company_location: string;
  company_id: number;
}

export default function JobsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchJobs();
  }, [user, authLoading]);

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getAll();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: number) => {
    setApplying(jobId);
    setMessage(null);
    try {
      const result = await applicationAPI.apply(jobId);
      setMessage({ type: 'success', text: result.message });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to apply' });
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    j.company_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dae2fd', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            Available Placements
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Browse & apply to premium software engineering roles
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
            placeholder="Search role or company..."
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

      {/* Message */}
      {message && (
        <div style={{
          marginBottom: '24px', padding: '14px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '500', borderLeft: '4px solid',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#14532d' : '#7f1d1d',
          borderLeftColor: message.type === 'success' ? '#16a34a' : '#dc2626',
        }}>
          {message.text}
        </div>
      )}

      {/* Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredJobs.map((job) => (
          <div
            key={job.job_id}
            style={{
              background: '#ffffff', borderRadius: '12px',
              padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#dbe1ff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '4px' }}>
                  {job.role}
                </h3>
                <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {job.company_name}
                </p>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: '700', color: '#434655',
                background: '#f2f3ff', padding: '4px 10px', borderRadius: '9999px',
                textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>
                {job.company_location}
              </span>
            </div>

            {/* Details */}
            <div style={{
              background: '#f8fafc', borderRadius: '10px', padding: '16px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', flex: 1,
            }}>
              <div>
                <span style={{ fontSize: '10px', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Min CGPA
                </span>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#131b2e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {job.min_cgpa}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Package
                </span>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#004ac6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ₹{(job.salary / 100000).toFixed(1)}L
                </p>
              </div>
            </div>

            {/* Apply Button */}
            {user?.role === 'student' && (
              <button
                onClick={() => handleApply(job.job_id)}
                disabled={applying === job.job_id}
                style={{
                  width: '100%', padding: '12px',
                  background: applying === job.job_id ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #004ac6)',
                  color: 'white', fontWeight: '700', fontSize: '14px',
                  border: 'none', borderRadius: '10px',
                  cursor: applying === job.job_id ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {applying === job.job_id ? (
                  <>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Processing…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>work_off</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#131b2e' }}>No Placements Found</h3>
          <p style={{ color: '#737686', fontSize: '13px', marginTop: '6px' }}>Try adjusting your search query or check back later.</p>
        </div>
      )}
    </div>
  );
}
