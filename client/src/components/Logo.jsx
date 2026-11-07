import { Link } from 'react-router-dom';
import { imgUrl } from '../lib/image.js';

export function BitMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="bitmark">
      <rect x="3" y="3" width="11" height="11" rx="3" fill="#2F6BFF" />
      <rect x="18" y="3" width="11" height="11" rx="3" fill="#2F6BFF" />
      <rect x="3" y="18" width="11" height="11" rx="3" fill="#2F6BFF" />
      <rect x="19" y="19" width="9" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export default function Logo({ site, to = '/' }) {
  const name = site?.brandName || 'BitCrew Network';
  return (
    <Link to={to} className="logo" aria-label={`${name} home`}>
      {site?.logo?.url ? (
        <img src={imgUrl(site.logo, { h: 72, crop: 'limit' })} alt={name} height="36" />
      ) : (
        <>
          <BitMark />
          <span className="logo__name">{name}</span>
        </>
      )}
    </Link>
  );
}
