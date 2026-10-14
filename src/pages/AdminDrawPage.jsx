import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDrawPage() {
  const { user } = useAuth();
  const [drawState, setDrawState] = useState(null);
  const [eligibleEntries, setEligibleEntries] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [resettingDraw, setResettingDraw] = useState(false);
  const [deletingAllEntries, setDeletingAllEntries] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadDrawData();
  }, []);

  const loadDrawData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get draw state
      const { data: drawData, error: drawError } = await supabase
        .from('draw_state')
        .select('*')
        .single();

      if (drawError) throw drawError;
      setDrawState(drawData);

      if (drawData.draw_executed) {
        // Load winners if draw already executed
        const { data: winnersData, error: winnersError } = await supabase
          .from('winners')
          .select(`
            *,
            prizes (prize_number, prize_name, variety_name)
          `)
          .order('prize_number', { ascending: true });

        if (winnersError) throw winnersError;
        setWinners(winnersData || []);
        setShowResults(true);
      } else {
        // Load preview of eligible entries
        const { data: previewData, error: previewError } = await supabase
          .rpc('get_draw_preview');

        if (previewError) throw previewError;
        setEligibleEntries(previewData.eligible_codes || []);
      }

    } catch (err) {
      console.error('Error loading draw data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDraw = async () => {
    if (!confirm('Are you sure you want to execute the lucky draw? This action cannot be reversed.')) {
      return;
    }

    try {
      setError(null);
      setIsSpinning(true);

      // Call the secure backend function to execute draw
      const { data, error: drawError } = await supabase
        .rpc('execute_draw', { p_admin_id: user.id });

      if (drawError) throw drawError;

      if (!data.success) {
        throw new Error(data.error || 'Draw execution failed');
      }

      // Animate the wheel for each winner
      await animateDrawResults(data.winners);

      // Reload data
      await loadDrawData();

    } catch (err) {
      console.error('Draw execution error:', err);
      setError(err.message);
      setIsSpinning(false);
    }
  };

  const handleResetDraw = async () => {
    if (!confirm('Reset the draw? Winners will be removed but registrations will remain.')) return;
    try {
      setResettingDraw(true);
      setError(null);
      const { data, error: err } = await supabase.rpc('reset_draw_data', { p_delete_entries: false });
      if (err) throw err;
      if (!data?.success) throw new Error(data?.error || 'Reset failed');
      await loadDrawData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setResettingDraw(false);
    }
  };

  const handleDeleteAllEntries = async () => {
    if (!confirm('Delete all entries, winners, and reset the draw? This cannot be undone.')) return;
    if (!confirm('This permanently removes every registration. Confirm again.')) return;
    try {
      setDeletingAllEntries(true);
      setError(null);
      const { data, error: err } = await supabase.rpc('reset_draw_data', { p_delete_entries: true });
      if (err) throw err;
      if (!data?.success) throw new Error(data?.error || 'Delete failed');
      await loadDrawData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDeletingAllEntries(false);
    }
  };

  const animateDrawResults = async (winnersData) => {
    for (let i = 0; i < winnersData.length; i++) {
      const winner = winnersData[i];
      setCurrentPrize({ number: winner.prize_number, winner: null });

      // Simulate wheel spinning animation
      await new Promise(resolve => {
        drawWheel(eligibleEntries, i);
        setTimeout(() => {
          setCurrentPrize({ number: winner.prize_number, winner: winner.entry_code });
          resolve();
        }, 3000 + i * 1000); // Each prize takes longer
      });

      // Pause between prizes
      if (i < winnersData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsSpinning(false);
    setShowResults(true);
  };

  const drawWheel = (entries, prizeIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let rotation = 0;
    const spinSpeed = 0.2;
    let animationId;

    const animate = () => {
      rotation += spinSpeed;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw wheel
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      const segmentAngle = (2 * Math.PI) / entries.length;

      entries.forEach((entry, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // Segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Alternating colors
        ctx.fillStyle = index % 2 === 0 ? '#d4af37' : '#c9a229';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(entry.slice(-4), radius * 0.7, 0);
        ctx.restore();
      });

      ctx.restore();

      // Draw pointer
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX - 15, 50);
      ctx.lineTo(centerX + 15, 50);
      ctx.closePath();
      ctx.fillStyle = '#ff0040';
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Stop after 3 seconds
    setTimeout(() => {
      cancelAnimationFrame(animationId);
    }, 3000 + prizeIndex * 1000);
  };

  if (loading) return <LoadingSpinner message="Loading draw interface..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDrawData} />;

  // Draw already executed - show results
  if (showResults && winners.length > 0) {
    return (
      <>
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Draw Results</h1>
            <p className="admin-subtitle">Winners selected by the secure server-side draw</p>
          </div>
          <span className="admin-pill admin-pill-open">Completed</span>
        </div>

        <div className="admin-card" style={{
          textAlign: 'center', marginBottom: '1.4rem',
          background: 'rgba(22,163,74,0.06)', borderColor: 'rgba(22,163,74,0.25)',
        }}>
          <div style={{ fontSize: '2.6rem', marginBottom: '0.4rem', color: '#4ade80' }}>✓</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0d060', margin: '0 0 0.3rem' }}>
            Draw Completed Successfully
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            The lucky draw has been executed and winners have been selected.
          </p>
        </div>

        <div className="admin-grid-3">
          {winners.map((winner) => (
            <div key={winner.id} className="admin-card" style={{ textAlign: 'center', borderColor: 'rgba(212,175,55,0.35)' }}>
              <div style={{ marginBottom: '0.9rem' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #f0d060, #d4af37 55%, #b8912a)',
                  color: '#0b1220', fontWeight: 800, fontSize: '0.82rem',
                  padding: '0.3rem 1.1rem', borderRadius: '999px',
                }}>
                  Prize {winner.prizes.prize_number}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0d060', margin: '0 0 0.3rem' }}>
                {winner.prizes.prize_name}
              </h3>
              {winner.prizes.variety_name && (
                <p style={{ color: '#38bdf8', fontSize: '0.85rem', margin: '0 0 0.9rem' }}>{winner.prizes.variety_name}</p>
              )}
              <div style={{
                background: '#070c16', border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '10px', padding: '0.9rem',
              }}>
                <p style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Winning Entry</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0d060', fontFamily: 'monospace', margin: 0 }}>
                  {winner.entry_code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Draw not executed - show interface
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Execute Lucky Draw</h1>
          <p className="admin-subtitle">Select 3 distinct winners from verified entries</p>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1.2rem' }}>
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Draw controls */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Draw Controls</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDraw}
            disabled={resettingDraw || deletingAllEntries}
            className="admin-btn admin-btn-ghost"
          >
            {resettingDraw ? 'Resetting…' : 'Reset Draw'}
          </button>
          <button
            onClick={handleDeleteAllEntries}
            disabled={resettingDraw || deletingAllEntries}
            className="admin-btn admin-btn-danger"
          >
            {deletingAllEntries ? 'Deleting…' : 'Delete All Entries'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-card-title">Draw Status</div>
        <div className="admin-grid-2">
          <div className="admin-stat">
            <div className="admin-stat-label">Eligible Entries</div>
            <div className="admin-stat-value" style={{ color: '#4ade80' }}>{eligibleEntries.length}</div>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.4rem 0 0' }}>Verified payments only</p>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Winners to Select</div>
            <div className="admin-stat-value" style={{ color: '#38bdf8' }}>3</div>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.4rem 0 0' }}>Three distinct winners</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      {eligibleEntries.length < 3 && (
        <div className="admin-card" style={{
          marginBottom: '1.2rem', background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.25)',
        }}>
          <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.88rem' }}>
            Not enough eligible entries. At least 3 verified entries are required to execute the draw.
          </p>
        </div>
      )}

      {/* Wheel Animation Area */}
      {isSpinning && (
        <div className="admin-card" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div className="admin-card-title" style={{ textAlign: 'center' }}>
            Drawing Prize {currentPrize?.number}…
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ maxWidth: '100%', margin: '0 auto', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50%' }}
          />
          {currentPrize?.winner && (
            <div style={{
              margin: '1.4rem auto 0', maxWidth: '24rem',
              background: '#070c16', border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '10px', padding: '1.2rem',
            }}>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Winner — Prize {currentPrize.number}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f0d060', fontFamily: 'monospace', margin: 0 }}>
                {currentPrize.winner}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Execute Button */}
      {!isSpinning && (
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <div className="admin-card-title" style={{ textAlign: 'center' }}>Ready to Execute Draw</div>
          <p style={{ color: '#94a3b8', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
            This will randomly select 3 distinct winners from {eligibleEntries.length} verified entries.
          </p>
          <div style={{
            background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: '10px', padding: '0.9rem', margin: '0 auto 1.4rem', maxWidth: '42rem',
            textAlign: 'left',
          }}>
            <p style={{ color: '#fbbf24', fontSize: '0.82rem', margin: 0 }}>
              <strong>Important:</strong> This action is permanent and cannot be undone. The draw uses a
              secure random selection method and results will be publicly visible. Make sure all payments
              have been verified before proceeding.
            </p>
          </div>
          <button
            onClick={executeDraw}
            disabled={eligibleEntries.length < 3}
            className="admin-btn admin-btn-gold"
            style={{ padding: '0.9rem 2.4rem', fontSize: '1rem' }}
          >
            Execute Lucky Draw
          </button>
        </div>
      )}
    </>
  );
}
