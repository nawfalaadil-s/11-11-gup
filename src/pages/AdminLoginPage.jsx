import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;

      const { data: profile, error: perr } = await supabase
        .from('admin_profiles').select('*').eq('id', data.user.id).single();
      if (perr || !profile) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem', background: '#070c16',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.1rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '2.4rem', height: '2.4rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f0d060, #d4af37 55%, #8f7008)',
              color: '#0b1220', fontSize: '0.85rem', fontWeight: 900,
              boxShadow: '0 4px 16px rgba(212,175,55,0.32)',
            }}>11</span>
            <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ display: 'block', color: '#f0d060', fontWeight: 800, fontSize: '1.05rem' }}>
                11:11 Guppy Garage
              </span>
              <span style={{
                display: 'block', color: '#64748b', fontSize: '0.62rem',
                textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600,
              }}>
                Admin Panel
              </span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Sign in</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Access the administrative dashboard
          </p>
        </div>

        {error && <div style={{ marginBottom: '1rem' }}><ErrorMessage message={error} /></div>}

        <form onSubmit={handleLogin} className="admin-card">
          <div className="admin-field">
            <label className="admin-label">Email Address</label>
            <input
              type="email" className="admin-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com" disabled={loading} required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Password</label>
            <input
              type="password" className="admin-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" disabled={loading} required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="admin-btn admin-btn-gold w-full"
            style={{ padding: '0.75rem', marginTop: '0.4rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: '0.83rem', textDecoration: 'underline',
              fontFamily: 'inherit',
            }}
          >
            ← Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
