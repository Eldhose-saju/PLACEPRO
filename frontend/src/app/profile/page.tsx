// =============================================================================
// Student Profile Page — View & Edit (design.html theme)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { studentAPI } from '@/lib/api';

interface StudentProfile {
  student_id: number;
  name: string;
  email: string;
  phone: string;
  cgpa: number;
  skills: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: '#f2f3ff', border: '1.5px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', color: '#131b2e',
  outline: 'none', transition: 'all 0.15s', fontFamily: 'inherit',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.background = '#fff'; e.target.style.borderColor = '#2563eb';
  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.background = '#f2f3ff'; e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
};

export default function StudentProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', cgpa: '', skills: '' });
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) { router.push('/login'); return; }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const data = await studentAPI.getProfile();
      setProfile(data);
      setForm({ phone: data.phone || '', cgpa: String(data.cgpa || ''), skills: data.skills || '' });
    } catch (err) { console.error('Failed to fetch profile:', err); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null);
    if (!profile) return;
    try {
      await studentAPI.update(profile.student_id, { phone: form.phone, cgpa: parseFloat(form.cgpa), skills: form.skills });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false); fetchProfile();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dae2fd', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const fieldLabel = (text: string) => (
    <p style={{ fontSize: '10px', fontWeight: 700, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{text}</p>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#131b2e', letterSpacing: '-0.02em' }}>
            My Profile
          </h3>
          <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
            Manage your academic details and resume information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
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
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            Edit Profile
          </button>
        )}
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

      {/* Avatar Banner */}
      {profile && (
        <div style={{
          background: 'linear-gradient(135deg, #004ac6, #2563eb)',
          borderRadius: '12px 12px 0 0', padding: '32px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: 'white',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backdropFilter: 'blur(8px)',
          }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.name}</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>{profile.email}</p>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div style={{
        background: '#ffffff', borderRadius: '0 0 12px 12px',
        padding: '28px 32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        {(!isEditing && profile) ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div>
              {fieldLabel('Full Name')}
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e' }}>{profile.name}</p>
            </div>
            <div>
              {fieldLabel('College Email')}
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e' }}>{profile.email}</p>
            </div>
            <div>
              {fieldLabel('Phone Number')}
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#131b2e' }}>{profile.phone || '—'}</p>
            </div>
            <div>
              {fieldLabel('Academic CGPA')}
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {profile.cgpa ? profile.cgpa.toFixed(2) : '—'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              {fieldLabel('Technical Skills')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {profile.skills ? profile.skills.split(',').map((skill, idx) => (
                  <span key={idx} style={{
                    padding: '5px 14px', background: '#f2f3ff', border: '1px solid #e2e8f0',
                    borderRadius: '9999px', fontSize: '13px', color: '#434655', fontWeight: '600',
                  }}>
                    {skill.trim()}
                  </span>
                )) : (
                  <p style={{ fontSize: '14px', color: '#737686' }}>No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : profile && (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#434655', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Phone Number</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#434655', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>CGPA (out of 10)</label>
                <input type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} placeholder="e.g. 8.5" required style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#434655', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Technical Skills (comma separated)</label>
                <textarea
                  value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  rows={3} placeholder="E.g. Python, React, Data Analysis"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={focusInput as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurInput as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button type="submit" style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #2563eb, #004ac6)',
                color: 'white', fontWeight: '700', fontSize: '14px',
                border: 'none', borderRadius: '9px', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}>
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{
                padding: '10px 20px',
                background: 'transparent', border: '1px solid #e2e8f0',
                color: '#737686', fontWeight: '600', fontSize: '14px',
                borderRadius: '9px', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
