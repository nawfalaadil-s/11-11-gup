import { useState, useCallback } from 'react';

const SEGMENTS = [
  { label: 'Prize 1', color: '#d4af37' },
  { label: 'Betta Drop', color: '#123a5c' },
  { label: 'Prize 2', color: '#9aa7b8' },
  { label: 'Lucky Spot', color: '#0e7fb8' },
  { label: 'Prize 3', color: '#cd7f32' },
  { label: 'Double Luck', color: '#7a1030' },
];

const STEP = 360 / SEGMENTS.length;

export default function LuckySpin() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setLanded(null);

    // Decorative animation only. Winners are selected server-side.
    const target = Math.floor(Math.random() * SEGMENTS.length);
    const spins = 6 + Math.floor(Math.random() * 3);
    const next = rotation + spins * 360 + (360 - (target * STEP + STEP / 2));

    setRotation(next);

    window.setTimeout(() => {
      setSpinning(false);
      setLanded(target);
    }, 5600);
  }, [rotation, spinning]);

  return (
    <div className="spin-wrap">
      <div className="spin-stage">
        <div
          className="spin-wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${SEGMENTS.map(
              (s, i) => `${s.color} ${i * STEP}deg ${(i + 1) * STEP}deg`
            ).join(', ')})`,
          }}
        >
          {SEGMENTS.map((s, i) => (
            <div
              key={s.label}
              className="spin-segment"
              style={{ transform: `rotate(${i * STEP + STEP / 2}deg)` }}
            >
              <span className="spin-label" style={{ transform: 'rotate(180deg)' }}>
                {s.label}
              </span>
            </div>
          ))}
          <div className="spin-hub">11:11</div>
        </div>
        <div className="spin-pointer" />
      </div>

      <div className="spin-copy">
        <span className="section-eyebrow">The Lucky Spin</span>
        <h2 style={{ marginBottom: '0.75rem' }}>
          Feel The <span className="text-gold">Tension</span> Before The Reveal
        </h2>
        <p style={{ color: '#93a4bb', lineHeight: 1.75 }}>
          Give the wheel a spin for a taste of draw-night excitement. It is pure
          entertainment — every real result comes from the secure server-side draw.
        </p>

        <div className="spin-features">
          <div className="spin-feature">
            <span className="spin-feature-icon">🔒</span>
            <div>
              <div style={{ color: '#e6eefb', fontWeight: 600, fontSize: '0.9rem' }}>
                Server-Side Selection
              </div>
              <div style={{ color: '#7d8ea6', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Winners are chosen by the immutable <code style={{ color: '#00d4ff' }}>execute_draw</code> database function — never by this page.
              </div>
            </div>
          </div>
          <div className="spin-feature">
            <span className="spin-feature-icon">🎟️</span>
            <div>
              <div style={{ color: '#e6eefb', fontWeight: 600, fontSize: '0.9rem' }}>
                Verified Entries Only
              </div>
              <div style={{ color: '#7d8ea6', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Only entries whose payment has been manually verified enter the draw pool.
              </div>
            </div>
          </div>
          <div className="spin-feature">
            <span className="spin-feature-icon">⏳</span>
            <div>
              <div style={{ color: '#e6eefb', fontWeight: 600, fontSize: '0.9rem' }}>
                One-Time Lock
              </div>
              <div style={{ color: '#7d8ea6', fontSize: '0.82rem', lineHeight: 1.6 }}>
                The draw executes once on 19 October 2026 and cannot be rerun or altered.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className="btn-gold"
          >
            {spinning ? 'Spinning…' : 'Spin The Wheel'}
          </button>
          <span className="badge badge-blue">
            {landed !== null ? `Landed: ${SEGMENTS[landed].label} · demo only` : 'Fun preview'}
          </span>
        </div>

        <p className="spin-note" style={{ marginTop: '1rem' }}>
          This wheel never determines a winner. The official draw runs inside
          Supabase with a one-time lock, and results appear on the Winners page.
        </p>
      </div>
    </div>
  );
}

