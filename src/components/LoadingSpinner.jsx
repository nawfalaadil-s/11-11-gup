export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 1rem', minHeight: '50vh',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.2)',
        borderTopColor: '#d4af37', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: '1rem', color: '#8899aa', fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}
