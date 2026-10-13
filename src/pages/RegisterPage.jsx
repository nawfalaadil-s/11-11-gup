import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import BettaFish from '../components/BettaFish';
import { validateFullName, validateMobileNumber, validateEmail } from '../utils/validation';
import { isRegistrationOpen, getRemainingSlots } from '../utils/helpers';
import { validateScreenshotFile, uploadPaymentScreenshot } from '../utils/paymentProof';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [eventSettings, setEventSettings] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', email: '',
    membershipNote: '', transactionId: '', rulesAccepted: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: s } = await supabase.from('event_settings').select('*').single();
      setEventSettings(s);
      const { count } = await supabase.from('entries').select('*', { count: 'exact', head: true });
      setTotalEntries(count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    const nv = validateFullName(formData.fullName);
    if (!nv.valid) errs.fullName = nv.error;
    const mv = validateMobileNumber(formData.mobileNumber);
    if (!mv.valid) errs.mobileNumber = mv.error;
    if (formData.email) {
      const ev = validateEmail(formData.email);
      if (!ev.valid) errs.email = ev.error;
    }
    if (!formData.rulesAccepted) errs.rulesAccepted = 'You must accept the rules';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const mv = validateMobileNumber(formData.mobileNumber);

      // Upload payment screenshot first (if one was chosen)
      let screenshot = null;
      if (screenshotFile) {
        screenshot = await uploadPaymentScreenshot(screenshotFile);
      }

      const { data, error: err } = await supabase.rpc('create_entry', {
        p_full_name: formData.fullName.trim(),
        p_mobile_number: mv.normalized,
        p_email: formData.email ? formData.email.toLowerCase().trim() : null,
        p_membership_note: formData.membershipNote.trim() || null,
        p_payment_reference: formData.transactionId.trim() || null,
        p_payment_screenshot_url: screenshot ? screenshot.url : null,
        p_payment_screenshot_path: screenshot ? screenshot.path : null,
      });
      if (err) throw err;
      if (!data.success) throw new Error(data.error);
      setSuccess({ entryCode: data.entry_code, message: data.message, hasScreenshot: !!screenshot });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      clearScreenshot();
      return;
    }
    const check = validateScreenshotFile(file);
    if (!check.valid) {
      setFormErrors((p) => ({ ...p, screenshot: check.error }));
      clearScreenshot();
      return;
    }
    setFormErrors((p) => ({ ...p, screenshot: null }));
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const clearScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: null }));
  };

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!eventSettings) return <LoadingSpinner message="Loading..." />;

  const remaining = getRemainingSlots(totalEntries, eventSettings.max_participants);
  const open = isRegistrationOpen(eventSettings);
  const full = remaining <= 0;
  const takenPct = Math.min(
    100,
    Math.round((totalEntries / Math.max(1, eventSettings.max_participants)) * 100)
  );

  /* ---------- Success screen ---------- */
  if (success) {
    return (
      <div className="page-container" style={{ maxWidth: '560px' }}>
        <motion.div
          className="card card-gold"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <div className="hero-glow" aria-hidden="true" style={{ top: '-40%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: '140px', margin: '0 auto 1rem' }}>
              <BettaFish palette="gold" />
            </div>
            <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>
              Entry Created
            </span>
            <h2 style={{ marginBottom: '1.25rem' }}>Registration Successful!</h2>

            <div
              style={{
                background: 'rgba(6,13,26,0.85)',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ color: '#8899aa', fontSize: '0.75rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Entry Code
              </div>
              <div
                className="text-gold"
                style={{ fontSize: 'clamp(1.3rem, 6vw, 1.75rem)', fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}
              >
                {success.entryCode}
              </div>
            </div>

            <div
              style={{
                textAlign: 'left',
                background: 'rgba(10,22,40,0.65)',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(212,175,55,0.12)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Next Steps</h3>
              <ol
                style={{
                  color: '#8899aa',
                  fontSize: '0.85rem',
                  paddingLeft: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  lineHeight: 1.6,
                }}
              >
                {success.hasScreenshot ? (
                  <li>Payment screenshot uploaded — we have your proof</li>
                ) : (
                  <li>Complete payment of ₹{eventSettings.token_price} and send the screenshot + transaction ID to the organizer</li>
                )}
                <li>Wait for the admin to verify your payment</li>
                <li>Download your official entry token once verified</li>
                <li>
                  Save your entry code:{' '}
                  <span className="text-gold" style={{ fontFamily: 'monospace' }}>{success.entryCode}</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => navigate('/verify/' + success.entryCode)} className="btn-gold">
                Check My Status
              </button>
              <button onClick={() => navigate('/')} className="btn-outline">
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Closed / Full ---------- */
  if (!open || full) {
    return (
      <div className="page-container" style={{ maxWidth: '520px' }}>
        <motion.div
          className="card card-gold"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ width: '150px', margin: '0 auto 1rem' }}>
            <BettaFish palette="imperial" />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>
            {!open ? 'Registration Closed' : 'Maximum Capacity Reached'}
          </h2>
          <p style={{ color: '#8899aa', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            {!open
              ? 'Registration for this event is currently closed.'
              : `All ${eventSettings.max_participants} slots have been filled.`}
          </p>
          <div className="mb-4">
            <CountdownTimer />
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link to="/" className="btn-gold">Back to Home</Link>
            <Link to="/verify" className="btn-outline">Verify Token</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Registration form ---------- */
  return (
    <div className="page-container" style={{ maxWidth: '1040px' }}>
      <div className="page-header">
        <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
          Entry Registration
        </span>
        <h1 className="page-title">Claim Your Lucky Spot</h1>
        <p className="page-subtitle">
          One entry per mobile number · ₹{eventSettings.token_price} per token
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="register-grid"
      >
        {/* ---------- Sidebar ---------- */}
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ order: 2 }}
          className="register-aside"
        >
          <div className="stats-panel">
            <div className="stats-head">
              <span className="stats-live">
                <span className="live-dot" aria-hidden="true" />
                Availability
              </span>
              <span className="badge badge-gold">₹{eventSettings.token_price}</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div className="stat-label">Slots Remaining</div>
              <div
                className="stat-value"
                style={{ color: remaining <= 10 ? '#ff0040' : '#00d4ff', fontSize: '2.6rem' }}
              >
                {remaining}
                <span style={{ color: '#7d8ea6', fontSize: '1.2rem' }}>
                  {' '}/ {eventSettings.max_participants}
                </span>
              </div>
              <div className="slots-bar" style={{ marginTop: '0.85rem' }}>
                <div className="slots-bar-fill" style={{ width: `${takenPct}%` }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7d8ea6', marginTop: '0.5rem' }}>
                {takenPct}% filled · {totalEntries} registered
              </div>
              {remaining <= 10 && (
                <div className="badge badge-red" style={{ marginTop: '0.85rem' }}>
                  Hurry — limited slots left
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(212,175,55,0.14)', paddingTop: '1.15rem' }}>
              <div className="text-center" style={{ marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem' }}>Draw Starts In</h3>
              </div>
              <CountdownTimer compact />
            </div>

            <div
              style={{
                marginTop: '1.15rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(212,175,55,0.14)',
                fontSize: '0.8rem',
                color: '#7d8ea6',
                lineHeight: 1.65,
              }}
            >
              After registering, complete payment and wait for manual verification.
              Read the{' '}
              <Link to="/rules" className="text-gold" style={{ textDecoration: 'underline' }}>
                full rules
              </Link>{' '}
              before you enter.
            </div>
          </div>
        </motion.aside>

        {/* ---------- Form ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ order: 1 }}
        >
          {error && (
            <div
              className="card"
              style={{
                background: 'rgba(255,0,64,0.08)',
                border: '1px solid rgba(255,0,64,0.3)',
                marginBottom: '1.15rem',
                padding: '1rem',
                borderRadius: '12px',
              }}
            >
              <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text" name="fullName" value={formData.fullName}
                onChange={handleChange} className={`form-input${formErrors.fullName ? ' error' : ''}`}
                placeholder="Enter your full name" disabled={submitting} required
                autoComplete="name"
              />
              {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">Mobile Number *</label>
              <input
                id="mobileNumber"
                type="tel" name="mobileNumber" value={formData.mobileNumber}
                onChange={handleChange} className={`form-input${formErrors.mobileNumber ? ' error' : ''}`}
                placeholder="10-digit mobile number" disabled={submitting} required
                autoComplete="tel" inputMode="numeric"
              />
              {formErrors.mobileNumber && <div className="form-error">{formErrors.mobileNumber}</div>}
              <div className="form-hint">One entry per mobile number</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email" name="email" value={formData.email}
                onChange={handleChange} className={`form-input${formErrors.email ? ' error' : ''}`}
                placeholder="your@email.com" disabled={submitting}
                autoComplete="email"
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="membershipNote">Membership / Referral Note (Optional)</label>
              <input
                id="membershipNote"
                type="text" name="membershipNote" value={formData.membershipNote}
                onChange={handleChange} className="form-input"
                placeholder="Member ID or referral code" disabled={submitting}
              />
            </div>

            {/* ---------- Payment proof ---------- */}
            <div
              style={{
                background: 'rgba(10,22,40,0.5)',
                borderRadius: '12px',
                padding: '1.15rem',
                border: '1px solid rgba(212,175,55,0.16)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Payment Proof</span>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Optional</span>
              </div>
              <p style={{ color: '#7d8ea6', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Pay ₹{eventSettings.token_price} first, then add your transaction ID and a screenshot of
                the payment. This helps the admin verify you faster.
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="transactionId">Transaction ID</label>
                <input
                  id="transactionId"
                  type="text" name="transactionId" value={formData.transactionId}
                  onChange={handleChange} className="form-input"
                  placeholder="e.g. 304812345678" disabled={submitting}
                  autoComplete="off"
                />
                <div className="form-hint">Found in your payment app's receipt / history</div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="paymentScreenshot">Payment Screenshot</label>

                {!screenshotPreview ? (
                  <label
                    htmlFor="paymentScreenshot"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: '0.4rem', cursor: submitting ? 'not-allowed' : 'pointer',
                      border: `1.5px dashed ${formErrors.screenshot ? 'rgba(255,0,64,0.5)' : 'rgba(212,175,55,0.35)'}`,
                      borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center',
                      background: 'rgba(6,13,26,0.5)', transition: 'border-color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📤</span>
                    <span style={{ color: '#c9d4e0', fontSize: '0.85rem', fontWeight: 600 }}>
                      Tap to upload payment screenshot
                    </span>
                    <span style={{ color: '#556677', fontSize: '0.72rem' }}>
                      JPG, PNG or WebP · up to 5 MB
                    </span>
                  </label>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      style={{
                        width: '100%', maxHeight: '240px', objectFit: 'contain',
                        borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)',
                        background: 'rgba(6,13,26,0.6)',
                      }}
                    />
                    <button
                      type="button" onClick={clearScreenshot} disabled={submitting}
                      aria-label="Remove screenshot"
                      style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(6,13,26,0.85)', border: '1px solid rgba(255,0,64,0.5)',
                        color: '#ff6b6b', fontSize: '1rem', lineHeight: 1, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ color: '#7d8ea6', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                        {screenshotFile?.name}
                      </span>
                      <label
                        htmlFor="paymentScreenshot"
                        style={{ color: '#d4af37', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '0.75rem' }}
                      >
                        Change
                      </label>
                    </div>
                  </div>
                )}

                <input
                  id="paymentScreenshot"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleScreenshotChange}
                  disabled={submitting}
                  style={{ display: 'none' }}
                />
                {formErrors.screenshot && <div className="form-error">{formErrors.screenshot}</div>}
              </div>
            </div>

            <div
              className="form-group"
              style={{
                background: 'rgba(10,22,40,0.5)',
                borderRadius: '12px',
                padding: '1rem',
                border: `1px solid ${formErrors.rulesAccepted ? 'rgba(255,0,64,0.4)' : 'rgba(212,175,55,0.12)'}`,
              }}
            >
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox" name="rulesAccepted" checked={formData.rulesAccepted}
                  onChange={handleChange} disabled={submitting}
                  style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: '#d4af37', flexShrink: 0 }}
                />
                <span style={{ color: '#8899aa', fontSize: '0.85rem', lineHeight: 1.55 }}>
                  I have read and agree to the{' '}
                  <a href="/rules" target="_blank" rel="noreferrer" className="text-gold" style={{ textDecoration: 'underline' }}>
                    event rules, terms and conditions
                  </a>
                  , including the privacy notice. <span style={{ color: '#ff6b6b' }}>*</span>
                </span>
              </label>
              {formErrors.rulesAccepted && (
                <div className="form-error" style={{ marginTop: '0.5rem' }}>{formErrors.rulesAccepted}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold btn-gold-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {submitting ? 'Submitting…' : `Register — ₹${eventSettings.token_price}`}
            </button>

            <p style={{ color: '#556677', fontSize: '0.78rem', textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
              Your personal details stay private. Only your entry code is ever shown publicly.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
