import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import BettaFish from '../components/BettaFish';
import LuckySpin from '../components/LuckySpin';
import { getRemainingSlots, isRegistrationOpen } from '../utils/helpers';

const isVideo = (url) => !!url && /\.(mp4|webm|ogv|mov|m4v)(\?|$)/i.test(url);

const FAQS = [
  {
    q: 'When will the draw take place?',
    a: 'The lucky draw will be conducted on 19 October 2026 at 1:00 PM IST. All verified entries participate automatically — there is nothing extra to do on draw day.',
  },
  {
    q: 'How are the winners selected?',
    a: 'Winners are selected inside Supabase by a secure, random database function from all verified entries. The frontend never chooses a winner, and the draw runs exactly once behind a one-time lock so it cannot be repeated or manipulated.',
  },
  {
    q: 'How do I receive my entry token?',
    a: 'Once the organizer manually verifies your payment, your entry becomes verified and you can download the official entry token containing a unique entry code and QR verification.',
  },
  {
    q: 'Can I register multiple entries?',
    a: 'No. Each mobile number can register only once, which keeps the draw fair for every participant.',
  },
  {
    q: 'What happens if I win?',
    a: 'Winners are announced publicly by entry code on the Winners page. The organizer then contacts you directly to arrange prize collection or delivery.',
  },
  {
    q: 'Is my personal data public?',
    a: 'No. Only your entry code is ever shown publicly. Names, mobile numbers, emails and payment references stay private and are never encoded into the QR or the public winner listing.',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const [eventSettings, setEventSettings] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, countRes, prizesRes] = await Promise.all([
        supabase.from('event_settings').select('*').single(),
        supabase.rpc('get_entries_count'),
        supabase.from('prizes').select('*').order('prize_number', { ascending: true }),
      ]);

      setEventSettings(settingsRes.data);
      const countRaw = countRes.data;
const count = typeof countRaw === 'number'
  ? countRaw
  : (Array.isArray(countRaw) && countRaw.length
      ? (countRaw[0]?.get_entries_count ?? countRaw[0]?.count ?? 0)
      : (countRaw?.get_entries_count ?? countRaw?.count ?? 0));
setTotalEntries(typeof count === 'number' ? count : 0);
      setPrizes(prizesRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!eventSettings) return <LoadingSpinner message="Loading..." />;

  const remaining = getRemainingSlots(totalEntries, eventSettings.max_participants);
  const open = isRegistrationOpen(eventSettings);
  const full = remaining <= 0;
  const takenPct = Math.min(
    100,
    Math.round(
      (totalEntries / Math.max(1, eventSettings.max_participants)) * 100
    )
  );
  const totalPrizes = prizes.length || 3;

  const showcasePrizes = [1, 2, 3].map((n) => {
    const found = prizes.find((p) => p.prize_number === n);
    return (
      found || {
        id: `placeholder-${n}`,
        prize_number: n,
        prize_name: 'Exotic Betta',
        variety_name: null,
        description: 'To be announced by the organizer',
        image_url: null,
        is_placeholder_image: true,
      }
    );
  });

  const metrics = [
    { label: 'Token Price', value: `₹${eventSettings.token_price}`, color: '#d4af37' },
    { label: 'Participants', value: totalEntries, color: '#00d4ff' },
    { label: 'Slots Left', value: remaining, color: remaining <= 10 ? '#ff0040' : '#00ff88' },
    { label: 'Prizes', value: totalPrizes, color: '#f0d060' },
  ];

  const steps = [
    { num: '1', title: 'Register', desc: 'Fill the form and instantly receive your unique entry code.' },
    { num: '2', title: `Pay ₹${eventSettings.token_price}`, desc: 'Complete payment using the instructions shared by the organizer.' },
    { num: '3', title: 'Get Verified', desc: 'The admin manually verifies your payment and issues your token.' },
    { num: '4', title: 'Watch The Draw', desc: 'The secure draw runs live on 20 October and winners appear here.' },
  ];

  return (
    <div>
      {/* ============ 1. HERO ============ */}
      <section className="hero-section">
        <div className="page-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="hero-watermark" aria-hidden="true">11:11</div>

          <div className="hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-brand-tag">11:11 Guppy Garage</div>

              <span className="hero-eyebrow">
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 8px #00ff88',
                  }}
                />
                Registration {open && !full ? 'Now Open' : 'Closed'}
              </span>

              <h1 className="hero-title">
                Lucky Draw
                <span className="gold">Win Exotic Bettas</span>
              </h1>

              <p className="hero-sub">
                Three stunning exotic betta fish. ₹{eventSettings.token_price} per entry.
                A maximum of {eventSettings.max_participants} participants. One fair,
                server-verified draw on 19 October 2026 at 1:00 PM IST.
              </p>

              <div className="hero-ctas">
                {open && !full ? (
                  <>
                    <Link to="/register" className="btn-gold btn-gold-lg">
                      Register — ₹{eventSettings.token_price}
                    </Link>
                    <Link to="/rules" className="btn-outline btn-gold-lg">
                      Read The Rules
                    </Link>
                  </>
                ) : (
                  <span className="badge badge-red" style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                    {!open ? 'Registration Closed' : 'Maximum Capacity Reached'}
                  </span>
                )}
                <Link to="/verify" className="btn-outline btn-gold-lg">
                  Verify Token
                </Link>
              </div>

              <div className="hero-brands">
                <div>
                  <div className="hero-brand-label">Hosted by</div>
                  <div className="hero-brand-name" style={{ color: '#d4af37', fontWeight: 800 }}>
                    11:11 Guppy Garage
                  </div>
                </div>
                <div className="hero-divider" />
                <div>
                  <div className="hero-brand-label">Sponsored by</div>
                  <div className="hero-brand-name">11:11 Bettas</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hero-stage"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-ring" aria-hidden="true" />
              <div className="hero-ring-2" aria-hidden="true" />
              <div className="hero-glow" aria-hidden="true" />
              <BettaFish palette="crimson" />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '2%',
                  bottom: '2%',
                  width: 'min(42%, 190px)',
                  zIndex: 3,
                  transform: 'rotate(-8deg)',
                  opacity: 0.92,
                }}
              >
                <BettaFish palette="imperial" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 2. LIVE STATS ============ */}
      <section className="page-container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <motion.div
          className="stats-panel"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          style={{ maxWidth: '960px', margin: '0 auto' }}
        >
          <div className="stats-head">
            <span className="stats-live">
              <span className="live-dot" aria-hidden="true" />
              Live Event Stats
            </span>
            <span className="badge badge-blue">Draw 19 Oct 2026 · 1:00 PM IST</span>
          </div>

          <div className="metrics-grid">
            {metrics.map((m) => (
              <motion.div className="metric-tile" key={m.label} variants={reveal}>
                <div className="metric-value" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className="metric-label">{m.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={reveal} style={{ marginTop: '1.25rem' }}>
            <div
              className="flex items-center justify-between"
              style={{ fontSize: '0.78rem', color: '#7d8ea6', marginBottom: '0.15rem' }}
            >
              <span>{takenPct}% slots filled</span>
              <span>
                {totalEntries}/{eventSettings.max_participants} registered
              </span>
            </div>
            <div className="slots-bar">
              <div className="slots-bar-fill" style={{ width: `${takenPct}%` }} />
            </div>
          </motion.div>

          <motion.div
            variants={reveal}
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <div className="text-center" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem' }}>The Draw Starts In</h3>
            </div>
            <CountdownTimer />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ 3. PRIZE SHOWCASE ============ */}
      <section className="section">
        <div className="page-container">
          <div className="section-head">
            <span className="section-eyebrow">The Prizes</span>
            <h2>Three Exotic Bettas. One Lucky Night.</h2>
            <p className="section-lede">
              Hand-selected exotic betta varieties, sponsored by
              <span style={{ color: '#d4af37' }}> 11:11 Bettas</span> and hosted by
              <span style={{ color: '#d4af37' }}> 11:11 Guppy Garage</span> for our three fortunate winners.
            </p>
          </div>

          <motion.div
            className="showcase-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            style={{ maxWidth: '1040px', margin: '0 auto' }}
          >
            {showcasePrizes.map((prize) => (
              <motion.article className="showcase-card" key={prize.id} variants={reveal}>
                <div className={`showcase-rank rank-${prize.prize_number}`}>
                  Prize {prize.prize_number}
                </div>
                <div className="showcase-visual">
                  {prize.image_url && !prize.is_placeholder_image ? (
                    isVideo(prize.image_url) ? (
                      <video
                        src={prize.image_url}
                        controls
                        preload="metadata"
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={prize.image_url}
                        alt={prize.prize_name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )
                  ) : (
                    <div style={{ width: '82%', maxWidth: '260px' }}>
                      <BettaFish
                        palette={
                          prize.prize_number === 1
                            ? 'crimson'
                            : prize.prize_number === 2
                            ? 'imperial'
                            : 'gold'
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="showcase-body">
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>
                    {prize.prize_name}
                  </h3>
                  {prize.variety_name && (
                    <p style={{ color: '#00d4ff', fontWeight: 600, fontSize: '0.88rem' }}>
                      {prize.variety_name}
                    </p>
                  )}
                  <p style={{ color: '#8899aa', fontSize: '0.87rem', marginTop: '0.5rem', lineHeight: 1.65 }}>
                    {prize.description || 'Details to be announced by the organizer.'}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/prizes" className="btn-outline">
              View Full Prize Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 4. HOW THE DRAW WORKS ============ */}
      <section className="section" style={{ background: 'rgba(10, 22, 40, 0.35)' }}>
        <div className="page-container">
          <div className="section-head">
            <span className="section-eyebrow">The Process</span>
            <h2>How The Draw Works</h2>
            <p className="section-lede">
              Four simple steps, and a selection process you can verify for yourself.
            </p>
          </div>

          <motion.div
            className="steps-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            style={{ maxWidth: '1040px', margin: '0 auto' }}
          >
            {steps.map((step) => (
              <motion.div className="step-card" key={step.num} variants={reveal}>
                <div className="step-num">{step.num}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#8899aa', fontSize: '0.85rem', lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 5. THE LUCKY SPIN ============ */}
      <section className="section">
        <div className="page-container">
          <div
            className="card card-gold"
            style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.25rem' }}
          >
            <LuckySpin />
          </div>
        </div>
      </section>

      {/* ============ 6. VERIFY TOKEN ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="page-container">
          <motion.div
            className="band"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            style={{ maxWidth: '860px', margin: '0 auto' }}
          >
            <motion.div variants={reveal}>
              <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
                Entry Verification
              </span>
              <h2 style={{ marginBottom: '0.75rem' }}>Check Your Token Anytime</h2>
              <p style={{ color: '#93a4bb', maxWidth: '34rem', margin: '0 auto', lineHeight: 1.7 }}>
                Entered your code? Verify your payment status, confirm your slot,
                and see whether you are a winner — instantly and privately.
              </p>
              <div className="flex justify-center flex-wrap gap-2" style={{ marginTop: '1.5rem' }}>
                <Link to="/verify" className="btn-gold">
                  Verify My Token
                </Link>
                <Link to="/register" className="btn-outline">
                  Register A New Entry
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ 7. FAQ ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="page-container">
          <div className="section-head">
            <span className="section-eyebrow">Questions</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {FAQS.map((faq) => (
              <details className="faq-item" key={faq.q}>
                <summary>
                  <span>{faq.q}</span>
                  <span className="faq-chevron" aria-hidden="true">▾</span>
                </summary>
                <div className="faq-body">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8. FINAL CTA ============ */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: '4rem' }}>
        <div className="page-container">
          <motion.div
            className="band band-gold"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: '860px', margin: '0 auto' }}
          >
            <span className="hero-eyebrow" style={{ marginBottom: '1rem' }}>
              Only {remaining} of {eventSettings.max_participants} slots left
            </span>
            <h2 className="cta-title" style={{ marginBottom: '0.85rem' }}>
              Own A Piece Of The <span className="text-gold">11:11</span> Luck
            </h2>
            <p style={{ color: '#93a4bb', maxWidth: '34rem', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
              Registration costs just ₹{eventSettings.token_price}. One entry per
              mobile number, one verified pool, three exotic betta winners.
            </p>

            {open && !full ? (
              <div className="flex justify-center flex-wrap gap-2">
                <Link to="/register" className="btn-gold btn-gold-lg">
                  Secure My Entry
                </Link>
                <Link to="/rules" className="btn-outline btn-gold-lg">
                  Read Rules First
                </Link>
              </div>
            ) : (
              <span className="badge badge-red" style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                {!open ? 'Registration Closed' : 'Maximum Capacity Reached'}
              </span>
            )}

            {eventSettings.contact_email && (
              <p style={{ color: '#667788', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                Questions? {eventSettings.contact_email}
                {eventSettings.contact_phone ? ` · ${eventSettings.contact_phone}` : ''}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

