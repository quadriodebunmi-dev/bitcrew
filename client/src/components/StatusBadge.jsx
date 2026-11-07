const MAP = {
  available: ['Available to clients', 'ok'],
  community: ['Community activity', 'info'],
  planned: ['Planned', 'wait'],
  soon: ['Coming soon', 'wait'],
  open: ['Open now', 'ok'],
  past: ['Past', 'mute'],
};

// Text plus a dot, so status never depends on colour alone.
export default function StatusBadge({ status }) {
  const [label, tone] = MAP[status] || [status, 'mute'];
  return (
    <span className={`badge badge--${tone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
