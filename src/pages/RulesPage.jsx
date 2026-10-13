import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const revealCard = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

function RuleSection({ title, children }) {
  return (
    <motion.div className="card" style={{ marginBottom: '1.15rem' }} {...revealCard}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{title}</h3>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.65rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: '#8899aa', fontWeight: 500, fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: '#e6eefb', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function List({ items }) {
  return (
    <ul
      style={{
        color: '#93a4bb',
        fontSize: '0.9rem',
        paddingLeft: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        lineHeight: 1.65,
      }}
    >
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function RulesPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase.from('event_settings').select('*').single();
      setSettings(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading rules..." />;
  if (!settings) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="page-container" style={{ maxWidth: '760px' }}>
      <div className="page-header">
        <span className="section-eyebrow" style={{ justifyContent: 'center' }}>
          Terms & Conditions
        </span>
        <h1 className="page-title">Event Rules</h1>
        <p className="page-subtitle">
          Please read these rules carefully before registering.
        </p>
      </div>

      <RuleSection title="Event Details">
        <InfoRow label="Event Name" value={settings.event_name} />
        <InfoRow label="Organizer" value={settings.organizer_name} />
        <InfoRow label="Sponsor" value={settings.sponsor_name} />
        <InfoRow label="Draw Date" value="20 October 2026, 11:11 AM IST" />
        <InfoRow label="Timezone" value={settings.timezone} />
      </RuleSection>

      <RuleSection title="Entry Information">
        <InfoRow label="Entry Price" value={`₹${settings.token_price}`} />
        <InfoRow label="Maximum Participants" value={settings.max_participants} />
        <InfoRow label="Number of Prizes" value="3 exotic betta fish" />
        <InfoRow label="Minimum Age" value={`${settings.minimum_age || 18} years`} />
      </RuleSection>

      {settings.eligibility_text && (
        <RuleSection title="Eligibility">
          <p style={{ color: '#c8d6e5', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {settings.eligibility_text}
          </p>
        </RuleSection>
      )}

      <RuleSection title="Payment Instructions">
        {settings.payment_instructions ? (
          <p style={{ color: '#c8d6e5', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {settings.payment_instructions}
          </p>
        ) : (
          <p style={{ color: '#ffd700', fontSize: '0.9rem' }}>
            Payment instructions will be provided by the organizer.
          </p>
        )}
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255,200,0,0.08)',
            border: '1px solid rgba(255,200,0,0.2)',
          }}
        >
          <p style={{ color: '#ffd700', fontSize: '0.85rem', lineHeight: 1.65 }}>
            Payment verification is done manually by the administrator. Your entry
            is confirmed only after payment verification.
          </p>
        </div>
      </RuleSection>

      <RuleSection title="Winner Selection Method">
        <p style={{ color: '#c8d6e5', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.7 }}>
          Winners are selected through a secure, server-side random selection
          process from all verified entries:
        </p>
        <List
          items={[
            'Fair and transparent process',
            'Uses cryptographically secure random selection inside the database',
            'Limited to entries with verified payments only',
            'Conducted on 20 October 2026 at 11:11 AM IST',
            'Immutable once executed — the draw runs exactly once',
            'The website animation never chooses a winner',
          ]}
        />
        <p style={{ color: '#c8d6e5', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.7 }}>
          Three distinct winners will be selected, one for each prize.
        </p>
      </RuleSection>

      <RuleSection title="Prize Collection & Delivery">
        <p style={{ color: '#c8d6e5', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Winners are contacted by the organizer to arrange prize collection or
          delivery. Any delivery charges will be communicated to the winner.
          Winners must respond within a reasonable timeframe.
        </p>
      </RuleSection>

      {settings.refund_policy && (
        <RuleSection title="Refund & Cancellation Policy">
          <p style={{ color: '#c8d6e5', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {settings.refund_policy}
          </p>
        </RuleSection>
      )}

      <RuleSection title="General Rules">
        <List
          items={[
            'Each mobile number can register only once',
            'Entry is confirmed only after payment verification',
            'Verified entry tokens are provided after confirmation',
            "The organizer's decision is final in all matters",
            'Entries with false information may be disqualified',
          ]}
        />
      </RuleSection>

      {settings.privacy_notice && (
        <RuleSection title="Privacy Notice">
          <p style={{ color: '#c8d6e5', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {settings.privacy_notice}
          </p>
        </RuleSection>
      )}

      <RuleSection title="Contact">
        <p style={{ color: '#93a4bb', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          For any queries regarding this event:
        </p>
        {settings.contact_email && (
          <p className="text-gold" style={{ fontSize: '0.9rem' }}>
            Email: {settings.contact_email}
          </p>
        )}
        {settings.contact_phone && (
          <p className="text-gold" style={{ fontSize: '0.9rem' }}>
            Phone: {settings.contact_phone}
          </p>
        )}
      </RuleSection>

      <div className="band" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <p style={{ color: '#00d4ff', fontSize: '0.87rem', lineHeight: 1.7 }}>
          By registering, you acknowledge that you have read, understood and agree
          to all rules stated above.
        </p>
        <div className="flex justify-center gap-2 flex-wrap" style={{ marginTop: '1.25rem' }}>
          <Link to="/register" className="btn-gold">Register Now</Link>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
