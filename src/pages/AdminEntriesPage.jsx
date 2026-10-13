import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { generateQRCode, buildVerificationUrl } from '../utils/qrcode';
import { generateTokenImage, printToken } from '../utils/tokenGenerator';

export default function AdminEntriesPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [tokenQR, setTokenQR] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, statusFilter]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const [{ data, error: entriesError }, { data: s }] = await Promise.all([
        supabase.from('entries').select('*').order('created_at', { ascending: false }),
        supabase.from('event_settings').select('token_price, organizer_name, sponsor_name, event_name').single(),
      ]);

      if (entriesError) throw entriesError;
      setSettings(s);
      setEntries(data || []);

    } catch (err) {
      console.error('Error loading entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.payment_status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.full_name.toLowerCase().includes(term) ||
        e.mobile_number.includes(term) ||
        e.entry_code.toLowerCase().includes(term) ||
        (e.email && e.email.toLowerCase().includes(term))
      );
    }

    setFilteredEntries(filtered);
  };

  const handleVerifyPayment = async (entryId, status, rejectionReason = null) => {
    try {
      const { data, error: verifyError } = await supabase
        .rpc('verify_payment', {
          p_entry_id: entryId,
          p_admin_id: user.id,
          p_status: status,
          p_rejection_reason: rejectionReason
        });

      if (verifyError) throw verifyError;

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      // Reload entries
      await loadEntries();

      alert(`Payment ${status} successfully`);

    } catch (err) {
      console.error('Verification error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleShowToken = async (entry) => {
    if (entry.payment_status !== 'verified') {
      alert('Token can only be generated for verified entries');
      return;
    }

    setSelectedEntry(entry);

    // Generate QR code
    const verificationUrl = buildVerificationUrl(entry.entry_code);
    const qrCode = await generateQRCode(verificationUrl);
    setTokenQR(qrCode);
    setShowTokenModal(true);
  };

  const handleShowProof = (entry) => {
    setSelectedEntry(entry);
    setShowProofModal(true);
  };

  const handleDownloadToken = () => {
    generateTokenImage('entry-token-display', `token-${selectedEntry.entry_code}.png`);
  };

  const handlePrintToken = () => {
    printToken('entry-token-display');
  };

  const exportToCSV = () => {
    const headers = ['Entry Code', 'Full Name', 'Mobile Number', 'Email', 'Transaction ID', 'Screenshot', 'Payment Status', 'Registered At'];
    const rows = filteredEntries.map(e => [
      e.entry_code,
      e.full_name,
      e.mobile_number,
      e.email || '',
      e.payment_reference || '',
      e.payment_screenshot_url ? 'Yes' : 'No',
      e.payment_status,
      new Date(e.created_at).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner message="Loading entries..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadEntries} />;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Manage Entries</h1>
          <p className="admin-subtitle">Review payments, verify entries, and issue tokens</p>
        </div>
        <button onClick={exportToCSV} className="admin-btn admin-btn-gold">Export CSV</button>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: '1.2rem' }}>
        <div className="admin-grid-2">
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Search</label>
            <input
              type="text" className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, email, or entry code"
            />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Filter by Status</label>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.9rem' }}>
        Showing {filteredEntries.length} of {entries.length} entries
      </div>

      {/* Entries table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Entry Code</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id}>
                <td style={{ fontFamily: 'monospace', color: '#f0d060' }}>{entry.entry_code}</td>
                <td>{entry.full_name}</td>
                <td>{entry.mobile_number}</td>
                <td>
                  <span className={`admin-pill ${
                    entry.payment_status === 'verified' ? 'admin-pill-open' :
                    entry.payment_status === 'rejected' ? 'admin-pill-closed' : ''
                  }`} style={entry.payment_status === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' } : undefined}>
                    {entry.payment_status}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(entry.payment_reference || entry.payment_screenshot_url) && (
                      <button
                        onClick={() => handleShowProof(entry)}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        title="View payment proof"
                      >
                        Proof
                      </button>
                    )}
                    {entry.payment_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerifyPayment(entry.id, 'verified')}
                          className="admin-btn admin-btn-gold"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleVerifyPayment(entry.id, 'rejected', reason);
                          }}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {entry.payment_status === 'verified' && (
                      <button
                        onClick={() => handleShowToken(entry)}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Token
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            No entries found
          </div>
        )}
      </div>

      {/* Token Modal */}
      {showTokenModal && selectedEntry && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Entry Token</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>

            {/* Token Display */}
            <div id="entry-token-display" style={{
              background: '#0b1220', padding: '1.5rem', borderRadius: '12px',
              border: '1px solid rgba(212,175,55,0.4)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.12em' }}>OFFICIAL LUCKY DRAW ENTRY</p>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0d060', margin: '0 0 0.3rem' }}>
                  {settings?.event_name || '11:11 Lucky Draw'}
                </h4>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d4af37' }}>Hosted by {settings?.organizer_name || '11:11 Guppy Garage'}</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Sponsored by {settings?.sponsor_name || '11:11 Bettas'}</p>
              </div>

              <div style={{ borderTop: '1px solid rgba(212,175,55,0.25)', borderBottom: '1px solid rgba(212,175,55,0.25)', padding: '1rem 0', margin: '1rem 0' }}>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem' }}>Participant Name</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>{selectedEntry.full_name}</p>

                <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem' }}>Entry Code</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0d060', fontFamily: 'monospace', marginBottom: '1rem' }}>{selectedEntry.entry_code}</p>

                <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.3rem' }}>Payment Status</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>✓ VERIFIED</p>
              </div>

              {tokenQR && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <img src={tokenQR} alt="QR Code" style={{ width: '8rem', height: '8rem' }} />
                </div>
              )}

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748b' }}>
                <p>Token Price: ₹{settings?.token_price ?? 30}</p>
                <p style={{ marginTop: '0.3rem' }}>Scan QR code to verify entry</p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.2rem' }}>
              <button onClick={handleDownloadToken} className="admin-btn admin-btn-gold" style={{ flex: 1 }}>
                Download PNG
              </button>
              <button onClick={handlePrintToken} className="admin-btn admin-btn-ghost" style={{ flex: 1 }}>
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {showProofModal && selectedEntry && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Payment Proof</h3>
              <button
                onClick={() => setShowProofModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.1rem' }}>
              <span className="admin-pill" style={{ fontFamily: 'monospace' }}>{selectedEntry.entry_code}</span>
              <span className="admin-pill" style={{ textTransform: 'capitalize' }}>{selectedEntry.payment_status}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Participant</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{selectedEntry.full_name}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>{selectedEntry.mobile_number}</p>
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Transaction ID</p>
              {selectedEntry.payment_reference ? (
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0d060', fontFamily: 'monospace', margin: 0, wordBreak: 'break-all' }}>
                  {selectedEntry.payment_reference}
                </p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>Not provided</p>
              )}
            </div>

            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>Screenshot</p>
              {selectedEntry.payment_screenshot_url ? (
                <a href={selectedEntry.payment_screenshot_url} target="_blank" rel="noreferrer">
                  <img
                    src={selectedEntry.payment_screenshot_url}
                    alt="Payment screenshot"
                    style={{
                      width: '100%', maxHeight: '320px', objectFit: 'contain',
                      borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)',
                      background: '#070c16', display: 'block',
                    }}
                  />
                </a>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No screenshot uploaded</p>
              )}
            </div>

            {selectedEntry.payment_screenshot_url && (
              <a
                href={selectedEntry.payment_screenshot_url}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost w-full"
                style={{ marginTop: '1.1rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}
              >
                Open Full Size
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
