// =============================================================================
// Login Page — Placement Portal Auth (Matches design.html theme)
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      login({
        token: data.token,
        role: data.role,
        user_id: data.user_id,
        student_id: data.student_id,
        email: email,
      });
      router.push(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563eb, #004ac6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
        }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '28px' }}>school</span>
        </div>
        <h1 style={{
          fontSize: '26px', fontWeight: '800', color: '#131b2e',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Welcome Back
        </h1>
        <p style={{ color: '#737686', marginTop: '6px', fontSize: '14px' }}>
          Sign in to Placement Portal
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '32px',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email" style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: '#434655', marginBottom: '8px',
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@student.edu"
              style={{
                width: '100%', padding: '12px 16px',
                background: '#f2f3ff', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', fontSize: '14px', color: '#131b2e',
                outline: 'none', transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f2f3ff';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: '#434655', marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px',
                background: '#f2f3ff', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', fontSize: '14px', color: '#131b2e',
                outline: 'none', transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f2f3ff';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
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
              transition: 'all 0.2s ease',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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
                Signing in…
              </>
            ) : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#737686' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>

          {/* Demo Credentials */}
          <div style={{
            background: '#f2f3ff', border: '1px solid #e2e8f0',
            borderRadius: '10px', padding: '14px 16px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#434655', marginBottom: '6px' }}>
              Demo Credentials:
            </p>
            <p style={{ fontSize: '11px', color: '#737686', marginBottom: '2px' }}>
              Admin: admin@placement.edu / password123
            </p>
            <p style={{ fontSize: '11px', color: '#737686' }}>
              Student: aarav.sharma@student.edu / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
