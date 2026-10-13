import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import Toggle from '../components/Toggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: s } = await supabase.from('event_settings').select('*').single();
      const { data: entries } = await supabase.from('entries').select('payment_status');
      const { data: ds } = await supabase.from('draw_state').select('draw_executed').single();

      const total = entries?.length || 0;
      setSettings(s);
      setStats({
        total,
        pending: entries?.filter(e => e.payment_status === 'pending').length || 0,
        verified: entries?.filter(e => e.payment_status === 'verified').length || 0,
        rejected: entries?.filter(e => e.payment_status === 'rejected').length || 0,
        remaining: Math.max(0, (s?.max_participants || 50) - total),
        drawExecuted: ds?.draw_executed || false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // One-click registration toggle — saves immediately
  const toggleRegistration = async (next) => {
    const prev = settings.is_registration_open;
    setSettings(s => ({ ...s, is_registration_open: next }));
    setToggling(true);
    try {
      const { error } = await supabase
        .from('event_settings')
        .update({ is_registration_open: next })
        .eq('id', settings.id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setSettings(s => ({ ...s, is_registration_open: prev }));
      alert('Failed to update registration status: ' + err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!stats || !settings) return <LoadingSpinner message="Loading..." />;

  const regOpen = !!settings.is_registration_open;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">{settings.event_name} · {stats.total} of {settings.max_participants} slots used</p>
        </div>
        <span className={`admin-pill ${regOpen ? 'admin-pill-open' : 'admin-pill-closed'}`}>
          Registration {regOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Registration control */}
      <div className="admin-card" style={{ marginBottom: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="admin-card-title" style={{ marginBottom: '0.25rem' }}>Registration</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              {regOpen
                ? 'Participants can register and pay right now.'
                : 'The public site shows "Registration Closed". No new entries accepted.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <span
              style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: regOpen ? '#4ade80' : '#f87171',
              }}
            >
              {toggling ? 'Saving…' : regOpen ? 'Open' : 'Closed'}
            </span>
            <Toggle
              checked={regOpen}
              onChange={toggleRegistration}
              disabled={toggling}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-label">Total Registrations</div>
          <div className="admin-stat-value">{stats.total}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Pending Payments</div>
          <div className="admin-stat-value" style={{ color: stats.pending > 0 ? '#fbbf24' : undefined }}>{stats.pending}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Verified Entries</div>
          <div className="admin-stat-value" style={{ color: '#4ade80' }}>{stats.verified}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Rejected</div>
          <div className="admin-stat-value" style={{ color: stats.rejected > 0 ? '#f87171' : undefined }}>{stats.rejected}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Remaining Slots</div>
          <div className="admin-stat-value" style={{ color: '#f0d060' }}>{stats.remaining}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Draw Status</div>
          <div className="admin-stat-value" style={{ fontSize: '1.2rem', color: stats.drawExecuted ? '#4ade80' : '#94a3b8' }}>
            {stats.drawExecuted ? 'Complete' : 'Pending'}
          </div>
        </div>
      </div>

      {/* Pending alert */}
      {stats.pending > 0 && (
        <div
          className="admin-card"
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            background: 'rgba(251, 191, 36, 0.06)', borderColor: 'rgba(251, 191, 36, 0.22)',
            marginBottom: '1.2rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <strong style={{ color: '#fbbf24' }}>
              {stats.pending} payment{stats.pending !== 1 ? 's' : ''} awaiting verification
            </strong>
          </div>
          <button onClick={() => navigate('/admin/entries')} className="admin-btn admin-btn-gold">
            Review Now
          </button>
        </div>
      )}

      {/* Countdown */}
      {!stats.drawExecuted && (
        <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
          <div className="admin-card-title" style={{ textAlign: 'center' }}>Draw Countdown</div>
          <CountdownTimer />
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-title">Quick Actions</div>
        <div className="admin-grid-2">
          <button onClick={() => navigate('/admin/entries')} className="admin-btn admin-btn-ghost" style={{ padding: '0.8rem' }}>
            Manage Entries
          </button>
          <button onClick={() => navigate('/admin/prizes')} className="admin-btn admin-btn-ghost" style={{ padding: '0.8rem' }}>
            Edit Prizes
          </button>
          <button onClick={() => navigate('/admin/settings')} className="admin-btn admin-btn-ghost" style={{ padding: '0.8rem' }}>
            Event Settings
          </button>
          <button
            onClick={() => navigate('/admin/draw')}
            className="admin-btn admin-btn-ghost"
            style={{ padding: '0.8rem' }}
            disabled={stats.drawExecuted}
          >
            {stats.drawExecuted ? 'Draw Complete' : 'Execute Draw'}
          </button>
        </div>
      </div>
    </>
  );
}
