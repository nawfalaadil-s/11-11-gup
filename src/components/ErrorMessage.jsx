export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card" style={{
      maxWidth: '400px', margin: '3rem auto', textAlign: 'center',
      background: 'rgba(255,0,64,0.08)', border: '1px solid rgba(255,0,64,0.3)',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠</div>
      <h3 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Error</h3>
      <p style={{ color: '#8899aa', fontSize: '0.9rem', marginBottom: '1rem' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-gold">Try Again</button>
      )}
    </div>
  );
}
