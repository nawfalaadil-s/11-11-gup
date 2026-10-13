import { useMemo } from 'react';

function Bubble({ b }) {
  return (
    <div
      className="bubble"
      style={{
        left: `${b.left}%`,
        width: `${b.size}px`,
        height: `${b.size}px`,
        animationDuration: `${b.duration}s`,
        animationDelay: `${b.delay}s`,
      }}
    />
  );
}

function Particle({ p }) {
  return (
    <div
      className="water-particle"
      style={{
        left: `${p.left}%`,
        top: `${p.top}%`,
        animationDuration: `${p.duration}s`,
        animationDelay: `${p.delay}s`,
      }}
    />
  );
}

function SilhouetteFish({ f }) {
  return (
    <svg
      className="silhouette-fish"
      style={{
        top: `${f.top}%`,
        width: `${f.size}px`,
        animationDuration: `${f.duration}s`,
        animationDelay: `${f.delay}s`,
        transform: `scaleX(${f.dir})`,
      }}
      viewBox="0 0 120 60"
      aria-hidden="true"
    >
      <path
        d="M96 30 C96 18 78 10 58 12 C34 14 20 24 20 30 C20 36 34 46 58 48 C78 50 96 42 96 30 Z"
        fill="rgba(0, 212, 255, 0.6)"
      />
      <path
        d="M22 30 C14 20 6 14 0 12 C6 22 6 38 0 48 C6 46 14 40 22 30 Z"
        fill="rgba(0, 212, 255, 0.5)"
      />
      <circle cx="86" cy="27" r="3" fill="rgba(6, 13, 26, 0.9)" />
    </svg>
  );
}

export default function UnderwaterBackground() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 34 + 8,
        duration: Math.random() * 12 + 14,
        delay: Math.random() * 6,
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 6 + 5,
        delay: Math.random() * 4,
      })),
    []
  );

  const fish = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: 12 + Math.random() * 70,
        size: 34 + Math.random() * 34,
        duration: 40 + Math.random() * 55,
        delay: -Math.random() * 50,
        dir: i % 2 === 0 ? 1 : -1,
      })),
    []
  );

  return (
    <div className="underwater-bg" aria-hidden="true">
      {/* God rays */}
      <div className="light-rays" />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-10%',
          width: '45%',
          height: '100%',
          background:
            'linear-gradient(168deg, rgba(0,170,255,0.07) 0%, rgba(212,175,55,0.03) 30%, transparent 62%)',
          transform: 'skewX(-12deg)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '-8%',
          width: '38%',
          height: '100%',
          background:
            'linear-gradient(192deg, rgba(0,170,255,0.05) 0%, transparent 55%)',
          transform: 'skewX(10deg)',
          pointerEvents: 'none',
        }}
      />

      {/* Caustic light patches */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '20%',
          width: '55%',
          height: '35%',
          background:
            'radial-gradient(ellipse, rgba(140, 220, 255, 0.06) 0%, transparent 65%)',
          filter: 'blur(24px)',
          animation: 'pulse-glow 9s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Drifting silhouette fish */}
      {fish.map((f) => (
        <SilhouetteFish key={`f-${f.id}`} f={f} />
      ))}

      {/* Bubbles */}
      {bubbles.map((b) => (
        <Bubble key={`b-${b.id}`} b={b} />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={`p-${p.id}`} p={p} />
      ))}

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at top, rgba(0,212,255,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, transparent 55%, rgba(6,13,26,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
