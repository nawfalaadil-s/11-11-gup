import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import BettaFish from '../components/BettaFish';
import { formatDateTime } from '../utils/helpers';

export default function VerifyTokenPage() {
  const { entryCode } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputCode, setInputCode] = useState(entryCode || '');

  useEffect(() => {
    if (entryCode) verify(entryCode);
  }, [entryCode]);

  const verify = async (code) => {
    if (!code?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .rpc('verify_token', { p_entry_code: code.trim().toUpperCase() });
      if (err) throw err;
      if (!data?.valid) {
        setError(data?.message || 'Invalid entry code');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/verify/${inputCode.trim().toUpperCase()}`);
  };

  return (
    <div className="page-container" style={{ maxWidth: '560px' }}>
      <div className="page-header">
        <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
          Token Verification
        </span>
        <h1 className="page-title">Verify Your Entry</h1>
        <p className="page-subtitle">
          Check payment status, confirm your slot, and see if you won.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="entryCode">Enter Entry Code</label>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <input
              id="entryCode"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="form-input"
              placeholder="1111-XXXXXXXX"
              disabled={loading}
              style={{ flex: '1 1 180px', minWidth: 0 }}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="btn-gold"
              style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </div>
          <div className="form-hint">
            Your entry code was issued at registration. No personal data is shown here.
          </div>
        </div>
      </motion.form>

      {loading && <LoadingSpinner message="Verifying..." />}

      {error && !loading && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,0,64,0.08)',
            border: '1px solid rgba(255,0,64,0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✕</div>
          <h3 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Verification Failed</h3>
          <p style={{ color: '#93a4bb', fontSize: '0.9rem', lineHeight: 1.65 }}>{error}</p>
          <div style={{ marginTop: '1.15rem' }}>
            <Link to="/register" className="btn-outline">Register A New Entry</Link>
          </div>
        </motion.div>
      )}

      {result?.valid && (
        <motion.div
          className="card card-gold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '150px', margin: '0 auto 0.75rem' }}>
              <BettaFish palette={result.is_winner ? 'gold' : 'imperial'} />
            </div>
            <span className="badge badge-green">Valid Entry Token</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(6,13,26,0.7)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            >
              <div style={{ color: '#8899aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                Entry Code
              </div>
              <div className="text-gold" style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {result.entry_code}
              </div>
            </div>

            <div className="grid-2">
              <div style={{ background: 'rgba(10,22,40,0.55)', borderRadius: '12px', padding: '0.9rem' }}>
                <div style={{ color: '#8899aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  Participant
                </div>
                <div style={{ color: '#e6eefb', fontWeight: 600, fontSize: '0.92rem' }}>
                  {result.participant_name}
                </div>
              </div>
              <div style={{ background: 'rgba(10,22,40,0.55)', borderRadius: '12px', padding: '0.9rem' }}>
                <div style={{ color: '#8899aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  Payment
                </div>
                <span
                  className={
                    result.payment_status === 'verified'
                      ? 'badge badge-green'
                      : result.payment_status === 'rejected'
                      ? 'badge badge-red'
                      : 'badge badge-yellow'
                  }
                >
                  {result.payment_status === 'verified' && 'Verified'}
                  {result.payment_status === 'pending' && 'Pending'}
                  {result.payment_status === 'rejected' && 'Rejected'}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(10,22,40,0.55)', borderRadius: '12px', padding: '0.9rem' }}>
              <div style={{ color: '#8899aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Registered
              </div>
              <div style={{ color: '#e6eefb', fontSize: '0.9rem' }}>
                {formatDateTime(result.registered_at)}
              </div>
            </div>

            {result.draw_completed && (
              <div
                style={{
                  padding: '1.35rem',
                  borderRadius: '14px',
                  textAlign: 'center',
                  border: result.is_winner
                    ? '2px solid rgba(0,255,136,0.45)'
                    : '1px solid rgba(212,175,55,0.2)',
                  background: result.is_winner
                    ? 'rgba(0,255,136,0.07)'
                    : 'rgba(10,22,40,0.55)',
                }}
              >
                {result.is_winner ? (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <h3 style={{ marginBottom: '0.4rem' }}>Congratulations! You Won!</h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.95rem' }}>
                      Prize {result.prize_number}
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <p style={{ color: '#93a4bb', fontSize: '0.9rem' }}>
                      Draw completed. This entry did not win this time.
                    </p>
                  </>
                )}
              </div>
            )}

            {!result.draw_completed && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.2)',
                }}
              >
                <p style={{ color: '#00d4ff', fontSize: '0.87rem' }}>
                  Draw will be conducted on 20 October 2026
                </p>
              </div>
            )}

            {result.payment_status === 'pending' && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,200,0,0.08)',
                  border: '1px solid rgba(255,200,0,0.2)',
                }}
              >
                <p style={{ color: '#ffd700', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  Payment pending verification. Contact the organizer for assistance.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {!result && !error && !loading && (
        <div className="band" style={{ textAlign: 'center' }}>
          <p style={{ color: '#7d8ea6', fontSize: '0.88rem', lineHeight: 1.7 }}>
            Enter the entry code from your registration confirmation or entry token.
            Verification never exposes your personal details.
          </p>
          <div style={{ marginTop: '1.15rem' }}>
            <Link to="/register" className="btn-outline">Register A New Entry</Link>
          </div>
        </div>
      )}
    </div>
  );
}
