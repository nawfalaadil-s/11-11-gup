export default function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <label className="admin-toggle" style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="admin-toggle-track">
        <span className="admin-toggle-knob" />
      </span>
      {label && <span className="admin-toggle-text">{label}</span>}
    </label>
  );
}
