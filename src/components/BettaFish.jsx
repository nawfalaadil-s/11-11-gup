const PALETTES = {
  crimson: {
    bodyTop: '#ff4d6d',
    bodyMid: '#e8113c',
    bodyLow: '#7a001f',
    finA: '#ff7a94',
    finB: '#e8113c',
    finC: '#d4af37',
    belly: '#ffe3ea',
    glow: 'rgba(255, 77, 109, 0.55)',
  },
  gold: {
    bodyTop: '#fff3c4',
    bodyMid: '#e8c04a',
    bodyLow: '#8f7008',
    finA: '#f7e08a',
    finB: '#d4af37',
    finC: '#fff6cf',
    belly: '#fffbe9',
    glow: 'rgba(212, 175, 55, 0.55)',
  },
  imperial: {
    bodyTop: '#7de3ff',
    bodyMid: '#0e7fb8',
    bodyLow: '#053a5c',
    finA: '#9fe8ff',
    finB: '#0e7fb8',
    finC: '#d4af37',
    belly: '#e8fbff',
    glow: 'rgba(0, 212, 255, 0.5)',
  },
};

export default function BettaFish({ palette = 'crimson', className = '' }) {
  const c = PALETTES[palette] || PALETTES.crimson;
  const uid = `betta-${palette}`;

  return (
    <div className={`betta-fish ${className}`}>
      <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated exotic betta fish">
        <defs>
          <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.bodyTop} />
            <stop offset="55%" stopColor={c.bodyMid} />
            <stop offset="100%" stopColor={c.bodyLow} />
          </linearGradient>
          <linearGradient id={`${uid}-tail`} x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stopColor={c.finB} stopOpacity="0.95" />
            <stop offset="55%" stopColor={c.finA} stopOpacity="0.75" />
            <stop offset="100%" stopColor={c.finC} stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={`${uid}-fin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.finC} stopOpacity="0.9" />
            <stop offset="60%" stopColor={c.finA} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.finB} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${uid}-belly`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.belly} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c.belly} stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="fish-root">
          {/* ambient halo */}
          <ellipse cx="215" cy="152" rx="185" ry="115" fill={`url(#${uid}-halo)`} />

          {/* flowing veil tail */}
          <path
            className="fish-tail"
            d="M148 152
               C118 108 74 78 34 74
               C58 104 62 130 58 152
               C62 176 56 204 30 232
               C74 226 120 198 148 152 Z"
            fill={`url(#${uid}-tail)`}
          />
          <path
            className="fish-tail"
            d="M140 152 C112 122 82 100 54 92 C74 118 76 138 74 152 C76 168 72 188 50 214 C84 206 116 184 140 152 Z"
            fill={c.finC}
            opacity="0.22"
          />

          {/* dorsal fin */}
          <path
            className="fish-dorsal"
            d="M232 118
               C226 74 264 44 312 44
               C296 66 292 92 292 116
               C276 112 252 112 232 118 Z"
            fill={`url(#${uid}-fin)`}
            opacity="0.9"
          />

          {/* anal / ventral fin */}
          <path
            className="fish-ventral"
            d="M206 186
               C196 232 232 262 282 262
               C266 240 262 214 262 188
               C244 184 224 182 206 186 Z"
            fill={`url(#${uid}-fin)`}
            opacity="0.88"
          />

          {/* body */}
          <path
            d="M300 152
               C300 122 268 100 224 98
               C170 96 140 124 140 152
               C140 180 170 208 224 206
               C268 204 300 182 300 152 Z"
            fill={`url(#${uid}-body)`}
          />

          {/* belly highlight */}
          <path
            d="M290 168
               C276 190 246 204 210 204
               C176 204 152 186 146 166
               C168 196 250 200 290 168 Z"
            fill={`url(#${uid}-belly)`}
            opacity="0.55"
          />

          {/* scale shimmer */}
          <g opacity="0.3" fill="none" stroke={c.belly} strokeWidth="1.1">
            <path d="M200 118 C214 128 214 140 200 150" />
            <path d="M224 114 C240 126 240 142 224 154" />
            <path d="M248 116 C262 126 262 142 248 152" />
            <path d="M184 134 C194 142 194 152 184 160" />
          </g>

          {/* pectoral fin */}
          <path
            className="fish-pectoral"
            d="M246 168
               C258 194 288 206 306 194
               C288 186 272 176 262 164 Z"
            fill={`url(#${uid}-fin)`}
            opacity="0.85"
          />

          {/* gill plate */}
          <path
            d="M262 116 C252 138 252 168 262 190"
            fill="none"
            stroke={c.bodyLow}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* eye */}
          <g className="fish-eye">
            <circle cx="278" cy="138" r="11" fill="#f4f8ff" />
            <circle cx="280" cy="138" r="7.5" fill="#06101f" />
            <circle cx="282.5" cy="135.5" r="2.6" fill="#ffffff" />
          </g>

          {/* mouth */}
          <path
            d="M298 154 C303 152 306 154 307 157"
            fill="none"
            stroke={c.bodyLow}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );
}
