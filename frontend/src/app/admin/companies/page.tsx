// =============================================================================
// Admin Companies Page — CRUD Management (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { companyAPI } from '@/lib/api';

interface Company {
  company_id: number;
  name: string;
  location: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: '#f2f3ff', border: '1.5px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#131b2e',
  outline: 'none', transition: 'all 0.15s', fontFamily: 'inherit',
};

export default function AdminCompaniesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', location: '' });
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
    if (user) fetchCompanies();
  }, [user, authLoading]);

  const fetchCompanies = async () => {
    try { const data = await companyAPI.getAll(); setCompanies(data); }
    catch (err) { console.error('Failed to fetch companies:', err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null);
    try {
      if (editId) { await companyAPI.update(editId, form); setMessage({ type: 'success', text: 'Company updated' }); }
      else { await companyAPI.create(form); setMessage({ type: 'success', text: 'Company added' }); }
      setForm({ name: '', location: '' }); setEditId(null); setShowForm(false); fetchCompanies();
    } catch (err: unknown) { setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed' }); }
  };

  const handleEdit = (company: Company) => {
    setForm({ name: company.name, location: company.location || '' });
    setEditId(company.company_id); setShowForm(true);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this company? This will also delete associated jobs and applications.')) return;
    try { await companyAPI.delete(id); setMessage({ type: 'success', text: 'Company deleted' }); fetchCompanies(); }
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

  const filteredCompanies = companies.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            Companies
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>Manage registered partner companies</p>
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
              placeholder="Search by name or location..."
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
            onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', location: '' }); }}
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
            Add Company
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

      {/* Companies Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Company Name</th>
                <th style={thStyle}>Location</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr
                  key={company.company_id}
                  style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '16px 24px', fontSize: '12px', color: '#737686', fontFamily: 'monospace' }}>#{company.company_id}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '800', color: '#1d4ed8',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {company.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#131b2e' }}>{company.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#434655' }}>{company.location || '—'}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(company)} style={{
                      padding: '6px 14px', marginRight: '6px',
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(company.company_id)} style={{
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
          {filteredCompanies.length === 0 && companies.length > 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#737686' }}>
              No companies match your search.
            </div>
          )}
          {companies.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7', display: 'block', marginBottom: '12px' }}>business</span>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#131b2e' }}>No companies yet</p>
              <p style={{ color: '#737686', fontSize: '13px', marginTop: '4px' }}>Add a company using the button above.</p>
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
              {editId ? 'Edit Company' : 'Add New Company'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm({ name: '', location: '' }); }}
              style={{ background: 'none', border: 'none', color: '#737686', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Company Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Google" required style={inputStyle}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.background = '#f2f3ff'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#434655', marginBottom: '6px' }}>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" style={inputStyle}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.background = '#f2f3ff'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
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
              {editId ? 'Update Company' : 'Add Company'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
