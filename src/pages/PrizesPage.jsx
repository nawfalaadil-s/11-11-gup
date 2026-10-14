import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import BettaFish from '../components/BettaFish';

const isVideo = (url) => !!url && /\.(mp4|webm|ogv|mov|m4v)(\?|$)/i.test(url);

const PALETTES = { 1: 'crimson', 2: 'imperial', 3: 'gold' };

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

export default function PrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const { data } = await supabase
        .from('prizes')
        .select('*')
        .order('prize_number', { ascending: true });
      setPrizes(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading prizes..." />;

  const displayPrizes = prizes.length
    ? prizes
    : [1, 2, 3].map((n) => ({
        id: `placeholder-${n}`,
        prize_number: n,
        prize_name: 'Exotic Betta',
        variety_name: null,
        description: 'To be announced by the organizer',
        image_url: null,
        is_placeholder_image: true,
      }));

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
          Prize Gallery
        </span>
        <h1 className="page-title">Exotic Bettas Await</h1>
        <p className="page-subtitle">
          Three lucky winners will take home these carefully selected exotic betta fish.
        </p>
      </div>

      <motion.div
        className="showcase-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ maxWidth: '1040px', margin: '0 auto' }}
      >
        {displayPrizes.map((prize) => (
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
                  <BettaFish palette={PALETTES[prize.prize_number] || 'crimson'} />
                </div>
              )}
            </div>
            <div className="showcase-body">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>{prize.prize_name}</h3>
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

      <div className="band band-gold" style={{ maxWidth: '720px', margin: '3rem auto 0' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>About The Prizes</h3>
        <p style={{ color: '#93a4bb', fontSize: '0.92rem', marginBottom: '0.75rem', lineHeight: 1.7 }}>
          All prize fish are exotic betta varieties, selected for their colour,
          fin form and quality. Winners are contacted by the organizer to arrange
          prize collection or delivery.
        </p>
        <p style={{ color: '#556677', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Actual fish appearance may vary. Prize images are representative when available.
        </p>
        <div className="flex justify-center flex-wrap gap-2">
          <Link to="/register" className="btn-gold">Enter The Draw</Link>
          <Link to="/rules" className="btn-outline">Read The Rules</Link>
        </div>
      </div>
    </div>
  );
}
