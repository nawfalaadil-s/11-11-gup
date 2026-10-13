export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-title">Hosted By</div>
          <div className="footer-text" style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.05rem' }}>
            11:11 Guppy Garage
          </div>
        </div>
        <div>
          <div className="footer-title">Sponsored By</div>
          <div className="footer-text">11:11 Bettas</div>
        </div>
        <div>
          <div className="footer-title">Contact</div>
          <div className="footer-text">For queries, contact the organizer</div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} <span style={{ color: '#d4af37' }}>11:11 Guppy Garage</span> &middot; All rights reserved
      </div>
    </footer>
  );
}
