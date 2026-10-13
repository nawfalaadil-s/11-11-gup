import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toggle from '../components/Toggle';

const toLocalInput = (v) => (v ? new Date(v).toISOString().slice(0, 16) : '');
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: settingsError } = await supabase
        .from('event_settings').select('*').single();
      if (settingsError) throw settingsError;
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      const { error: updateError } = await supabase
        .from('event_settings').update(settings).eq('id', settings.id);
      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;
  if (error && !settings) return <ErrorMessage message={error} onRetry={loadSettings} />;
  if (!settings) return <ErrorMessage message="Settings not found" />;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Event Settings</h1>
          <p className="admin-subtitle">Manage event details, pricing, and registration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-gold">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1.2rem' }}>
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Registration */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Registration</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, maxWidth: '46ch' }}>
            When open, visitors can register and pay on the public site. When closed, they see a "Registration Closed" notice.
          </p>
          <Toggle
            checked={settings.is_registration_open}
            onChange={(v) => handleChange('is_registration_open', v)}
            label={settings.is_registration_open ? 'Open' : 'Closed'}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Basic Information</div>
        <div className="admin-field">
          <label className="admin-label">Event Name</label>
          <input
            type="text" className="admin-input"
            value={settings.event_name}
            onChange={(e) => handleChange('event_name', e.target.value)}
          />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label">Hosted By</label>
            <input
              type="text" className="admin-input"
              value={settings.organizer_name}
              onChange={(e) => handleChange('organizer_name', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Sponsored By</label>
            <input
              type="text" className="admin-input"
              value={settings.sponsor_name}
              onChange={(e) => handleChange('sponsor_name', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Draw & Pricing */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Draw &amp; Pricing</div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label">Token Price (₹)</label>
            <input
              type="number" className="admin-input" min="0"
              value={settings.token_price}
              onChange={(e) => handleChange('token_price', parseInt(e.target.value))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Maximum Participants</label>
            <input
              type="number" className="admin-input" min="1"
              value={settings.max_participants}
              onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Event / Draw Date</label>
            <input
              type="datetime-local" className="admin-input"
              value={toLocalInput(settings.event_date)}
              onChange={(e) => handleChange('event_date', fromLocalInput(e.target.value))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Registration Deadline</label>
            <input
              type="datetime-local" className="admin-input"
              value={toLocalInput(settings.registration_deadline)}
              onChange={(e) => handleChange('registration_deadline', fromLocalInput(e.target.value))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Minimum Age</label>
            <input
              type="number" className="admin-input" min="0"
              value={settings.minimum_age || 18}
              onChange={(e) => handleChange('minimum_age', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Contact Information</div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label">Contact Email</label>
            <input
              type="email" className="admin-input" placeholder="contact@example.com"
              value={settings.contact_email || ''}
              onChange={(e) => handleChange('contact_email', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Contact Phone</label>
            <input
              type="tel" className="admin-input" placeholder="+91 XXXXXXXXXX"
              value={settings.contact_phone || ''}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Rules &amp; Terms</div>
        <div className="admin-field">
          <label className="admin-label">Eligibility Criteria</label>
          <textarea
            className="admin-textarea" rows={3}
            placeholder="Describe who can participate..."
            value={settings.eligibility_text || ''}
            onChange={(e) => handleChange('eligibility_text', e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Payment Instructions</label>
          <textarea
            className="admin-textarea" rows={3}
            placeholder="Provide payment details and instructions..."
            value={settings.payment_instructions || ''}
            onChange={(e) => handleChange('payment_instructions', e.target.value)}
          />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label">Refund Policy</label>
            <textarea
              className="admin-textarea" rows={3}
              placeholder="Describe refund and cancellation policy..."
              value={settings.refund_policy || ''}
              onChange={(e) => handleChange('refund_policy', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Privacy Notice</label>
            <textarea
              className="admin-textarea" rows={3}
              placeholder="Describe how participant data will be used and protected..."
              value={settings.privacy_notice || ''}
              onChange={(e) => handleChange('privacy_notice', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Save (mobile convenience) */}
      <div className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="admin-card-title" style={{ marginBottom: '0.2rem' }}>Save Changes</div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            {saved ? 'Settings saved successfully.' : 'Review your changes before saving.'}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-gold">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </>
  );
}
