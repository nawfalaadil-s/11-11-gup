import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toggle from '../components/Toggle';

const isVideo = (url) => !!url && /\.(mp4|webm|ogv|mov|m4v)(\?|$)/i.test(url);

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPrize, setEditingPrize] = useState(null);

  useEffect(() => { loadPrizes(); }, []);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: prizesError } = await supabase
        .from('prizes').select('*').order('prize_number', { ascending: true });
      if (prizesError) throw prizesError;
      setPrizes(data || []);
    } catch (err) {
      console.error('Error loading prizes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (prizeId, updates) => {
    try {
      const { error: updateError } = await supabase
        .from('prizes').update(updates).eq('id', prizeId);
      if (updateError) throw updateError;
      await loadPrizes();
      setEditingPrize(null);
      alert('Prize updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner message="Loading prizes..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadPrizes} />;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Manage Prizes</h1>
          <p className="admin-subtitle">Edit the three prizes awarded to lucky winners</p>
        </div>
      </div>

      <div className="admin-grid-3">
        {prizes.map((prize) => (
          <div key={prize.id} className="admin-card">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f0d060, #d4af37 55%, #b8912a)',
                color: '#0b1220', fontWeight: 800, fontSize: '0.8rem',
                padding: '0.3rem 1.1rem', borderRadius: '999px', letterSpacing: '0.03em',
              }}>
                Prize {prize.prize_number}
              </span>
            </div>

            {editingPrize?.id === prize.id ? (
              <div>
                <div className="admin-field">
                  <label className="admin-label">Prize Name</label>
                  <input
                    type="text" className="admin-input"
                    value={editingPrize.prize_name}
                    onChange={(e) => setEditingPrize({ ...editingPrize, prize_name: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Variety Name</label>
                  <input
                    type="text" className="admin-input"
                    value={editingPrize.variety_name || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, variety_name: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Description</label>
                  <textarea
                    className="admin-textarea" rows={3}
                    value={editingPrize.description || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Image URL</label>
                  <input
                    type="url" className="admin-input"
                    value={editingPrize.image_url || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="admin-field">
                  <Toggle
                    checked={editingPrize.is_placeholder_image || false}
                    onChange={(v) => setEditingPrize({ ...editingPrize, is_placeholder_image: v })}
                    label="Placeholder image"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.4rem' }}>
                  <button
                    onClick={() => handleUpdate(prize.id, {
                      prize_name: editingPrize.prize_name,
                      variety_name: editingPrize.variety_name,
                      description: editingPrize.description,
                      image_url: editingPrize.image_url,
                      is_placeholder_image: editingPrize.is_placeholder_image,
                    })}
                    className="admin-btn admin-btn-gold" style={{ flex: 1 }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPrize(null)}
                    className="admin-btn admin-btn-ghost" style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  marginBottom: '1rem', background: '#070c16', borderRadius: '10px',
                  overflow: 'hidden', aspectRatio: '1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
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
                     <div style={{ textAlign: 'center', padding: '1rem' }}>
                       <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐠</div>
                       <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                         {prize.is_placeholder_image ? 'Placeholder' : 'No image'}
                       </p>
                     </div>
                   )}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0d060', textAlign: 'center', margin: '0 0 0.3rem' }}>
                  {prize.prize_name}
                </h3>
                {prize.variety_name && (
                  <p style={{ color: '#38bdf8', textAlign: 'center', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>{prize.variety_name}</p>
                )}
                {prize.description && (
                  <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', marginBottom: '1rem' }}>{prize.description}</p>
                )}
                <button
                  onClick={() => setEditingPrize({ ...prize })}
                  className="admin-btn admin-btn-ghost w-full"
                >
                  Edit Prize
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
