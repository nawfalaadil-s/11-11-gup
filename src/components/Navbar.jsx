import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ isAdmin = false }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `nav-link${isActive(path) ? ' active' : ''}`;

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/prizes', label: 'Prizes' },
    { to: '/rules', label: 'Rules' },
    { to: '/winners', label: 'Winners' },
    { to: '/verify', label: 'Verify Token' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/entries', label: 'Entries' },
    { to: '/admin/prizes', label: 'Prizes' },
    { to: '/admin/settings', label: 'Settings' },
    { to: '/admin/draw', label: 'Draw' },
  ];

  const links = isAdmin ? adminLinks : publicLinks;

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/'} className="navbar-logo">
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.9rem',
              height: '1.9rem',
              marginRight: '0.6rem',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #f0d060, #d4af37 55%, #8f7008)',
              color: '#060d1a',
              fontSize: '0.72rem',
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
              verticalAlign: 'middle',
              flexShrink: 0,
            }}
          >
            11
          </span>
          <span style={{ verticalAlign: 'middle', lineHeight: 1.15 }}>
            <span style={{ display: 'block', fontWeight: 800, letterSpacing: '0.01em' }}>
              11:11 Guppy Garage
            </span>
            <span
              style={{
                display: 'block',
                color: '#d4af37',
                fontWeight: 500,
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Lucky Draw
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links navbar-links-desktop" style={{ display: 'none' }}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
          {!isAdmin && (
            <Link
              to="/register"
              className="btn-gold"
              style={{ marginLeft: '0.5rem', padding: '0.55rem 1.3rem', fontSize: '0.875rem' }}
            >
              Register Now
            </Link>
          )}
          {isAdmin && (
            <Link to="/" className="btn-outline" style={{ marginLeft: '0.5rem', padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              View Site
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={linkClass(l.to)}>
            {l.label}
          </Link>
        ))}
        {!isAdmin && (
          <Link to="/register" className="btn-gold" style={{ marginTop: '0.5rem' }}>
            Register Now
          </Link>
        )}
        {isAdmin && (
          <Link to="/" className="btn-outline" style={{ marginTop: '0.5rem' }}>
            View Site
          </Link>
        )}
      </div>
    </nav>
  );
}
