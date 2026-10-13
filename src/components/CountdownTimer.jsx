import { useState, useEffect, useCallback } from 'react';

const DRAW_DATE = new Date('2026-10-20T11:11:00+05:30');

function getTimeLeft() {
  const now = new Date();
  const diff = DRAW_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function Unit({ value, label, accent }) {
  return (
    <div className="countdown-item">
      <div
        className="countdown-value"
        style={accent ? { color: accent, textShadow: `0 0 24px ${accent}66` } : undefined}
      >
        {value}
      </div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

export default function CountdownTimer({ compact = false }) {
  const [time, setTime] = useState(getTimeLeft);

  const tick = useCallback(() => {
    setTime(getTimeLeft());
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (time.expired) {
    return (
      <div className="text-center">
        <div className="badge badge-gold" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
          Draw Has Been Conducted
        </div>
        <p className="text-gold-subtle mt-2">
          Check the Winners page for results
        </p>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="text-center">
      <div className="countdown-container" style={compact ? { maxWidth: '460px' } : undefined}>
        <Unit value={time.days} label="Days" accent="#d4af37" />
        <Unit value={pad(time.hours)} label="Hours" accent="#f0d060" />
        <Unit value={pad(time.minutes)} label="Minutes" accent="#00d4ff" />
        <Unit value={pad(time.seconds)} label="Seconds" accent="#00ff88" />
      </div>
      <p className="mt-3" style={{ color: '#8899aa', fontSize: '0.85rem' }}>
        Draw Date:{' '}
        <span style={{ color: '#d4af37', fontWeight: 600 }}>
          20 October 2026, 11:11 AM IST
        </span>
      </p>
    </div>
  );
}
