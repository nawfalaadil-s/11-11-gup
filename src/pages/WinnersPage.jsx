import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import BettaFish from '../components/BettaFish';
import { formatDateTime } from '../utils/helpers';

const isVideo = (url) => !!url && /\.(mp4|webm|ogv|mov|m4v)(\?|$)/i.test(url);

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } };

export default function WinnersPage() {
  const [winners, setWinners] = useState([]);
  const [drawState, setDrawState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: ds } = await supabase.from('draw_state').select('*').single();
      setDrawState(ds);

      if (ds?.draw_executed) {
        const { data: w } = await supabase
          .from('winners')
          .select('*, prizes(prize_number, prize_name, variety_name, description, image_url, is_placeholder_image)')
          .order('prize_number', { ascending: true });
        setWinners(w || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  /* ---------- Draw not conducted ---------- */
  if (!drawState?.draw_executed) {
    return (
      <div className="page-container" style={{ maxWidth: '640px' }}>
        <div className="page-header">
          <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
            Winners
          </span>
          <h1 className="page-title">The Reveal Is Coming</h1>
        </div>

        <motion.div
          className="card card-gold"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <div className="hero-glow" aria-hidden="true" style={{ top: '-45%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: '170px', margin: '0 auto 1rem' }}>
              <BettaFish palette="crimson" />
            </div>
            <h2 style={{ marginBottom: '0.75rem' }}>Draw Not Yet Conducted</h2>
            <p style={{ color: '#93a4bb', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
              The lucky draw will be conducted on{' '}
              <span className="text-gold" style={{ fontWeight: 600 }}>19 October 2026</span>{' '}
              at 1:00 PM IST. Winners will appear here the moment the secure
              server-side draw completes.
            </p>
            <CountdownTimer />
            <div className="flex justify-center gap-2 flex-wrap" style={{ marginTop: '2rem' }}>
              <Link to="/register" className="btn-gold">Enter The Draw</Link>
              <Link to="/verify" className="btn-outline">Verify My Token</Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Draw completed ---------- */
  return (
    <div className="page-container">
      <div className="page-header">
        <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
          Official Results
        </span>
        <h1 className="page-title">Congratulations, Winners</h1>
        <p className="page-subtitle">
          Three exotic bettas have found their new homes.
        </p>
        {drawState.draw_executed_at && (
          <p style={{ color: '#556677', fontSize: '0.8rem', marginTop: '0.6rem' }}>
            Draw conducted: {formatDateTime(drawState.draw_executed_at)}
          </p>
        )}
      </div>

      <motion.div
        className="showcase-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ maxWidth: '1040px', margin: '0 auto' }}
      >
        {winners.map((winner) => {
          const prize = winner.prizes;
          return (
            <motion.article className="showcase-card" key={winner.id} variants={reveal}>
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
                        prize.prize_number === 1 ? 'crimson' : prize.prize_number === 2 ? 'imperial' : 'gold'
                      }
                    />
                  </div>
                )}
              </div>
              <div className="showcase-body">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{prize.prize_name}</h3>
                {prize.variety_name && (
                  <p style={{ color: '#00d4ff', fontSize: '0.87rem', marginBottom: '0.9rem' }}>
                    {prize.variety_name}
                  </p>
                )}
                <div
                  style={{
                    background: 'rgba(6,13,26,0.7)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '12px',
                    padding: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#8899aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                    Winning Entry
                  </div>
                  <div className="text-gold" style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {winner.entry_code}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <div className="band" style={{ maxWidth: '720px', margin: '2.5rem auto 0' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Selection Method</h3>
        <p style={{ color: '#93a4bb', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {drawState.draw_method}
        </p>
        <p style={{ color: '#556677', fontSize: '0.8rem' }}>
          Total eligible entries: {drawState.total_eligible_entries}
        </p>
      </div>

      <div className="band band-gold" style={{ maxWidth: '720px', margin: '1rem auto 0' }}>
        <p style={{ color: '#c8d6e5', fontSize: '0.92rem', lineHeight: 1.7 }}>
          If your entry code matches a winning code, the organizer will contact
          you to arrange prize collection.
        </p>
        <div className="flex justify-center gap-2 flex-wrap" style={{ marginTop: '1.25rem' }}>
          <Link to="/verify" className="btn-gold">Check My Entry</Link>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

