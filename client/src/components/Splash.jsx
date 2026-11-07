import { BitMark } from './Logo.jsx';

export function Splash({ label = 'Loading' }) {
  return (
    <div className="splash" role="status" aria-live="polite">
      <BitMark size={44} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }) {
  return (
    <div className="splash splash--error" role="alert">
      <BitMark size={44} />
      <h1>We could not load the site</h1>
      <p>{error?.message || 'Something went wrong.'}</p>
      <button className="btn btn--primary" onClick={onRetry}>Try again</button>
    </div>
  );
}
