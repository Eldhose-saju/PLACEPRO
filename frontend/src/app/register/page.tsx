// =============================================================================
// Register Page — Placement Portal (Matches design.html theme)
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

const inputStyle = {
  width: '100%', padding: '11px 16px',
  background: '#f2f3ff', border: '1.5px solid #e2e8f0',
  borderRadius: '10px', fontSize: '14px', color: '#131b2e',
  outline: 'none', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: '600' as const,
  color: '#434655', marginBottom: '6px',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', cgpa: '', skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.background = '#ffffff';
    e.target.style.borderColor = '#2563eb';
    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.background = '#f2f3ff';
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register({ ...form, cgpa: parseFloat(form.cgpa) });
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px' }} className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563eb, #004ac6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
        }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '28px' }}>school</span>
        </div>
        <h1 style={{
          fontSize: '24px', fontWeight: '800', color: '#131b2e',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Create Account
        </h1>
        <p style={{ color: '#737686', marginTop: '6px', fontSize: '14px' }}>
          Join the Placement Portal
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '16px', padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(19, 27, 46, 0.08)',
      }}>
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5',
            borderRadius: '10px', padding: '12px 16px',
            color: '#7f1d1d', fontSize: '13px', fontWeight: '500',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required placeholder="Aarav Sharma" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required placeholder="9876543210" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required placeholder="you@student.edu" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required minLength={6} placeholder="Minimum 6 characters" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>CGPA</label>
              <input name="cgpa" type="number" step="0.1" min="0.1" max="10" value={form.cgpa} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required placeholder="8.5" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Skills</label>
              <input name="skills" type="text" value={form.skills} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="Python, React, ML" style={inputStyle} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #004ac6)',
              color: 'white', fontWeight: '700', fontSize: '14px',
              border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Creating account…
              </>
            ) : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#737686' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
