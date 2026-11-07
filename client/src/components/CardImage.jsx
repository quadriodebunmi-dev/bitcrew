import { imgUrl } from '../lib/image.js';
import BitTile from './BitTile.jsx';

// A photo when there is one, otherwise a generated bit tile.
export default function CardImage({ image, seed, label, alt = '', w = 480, h = 640, eager = false }) {
  if (image?.url) {
    return (
      <img
        src={imgUrl(image, { w, h })}
        alt={alt || image.alt || ''}
        width={w}
        height={h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
      />
    );
  }
  return <BitTile seed={seed || label || 'bitcrew'} label={label} />;
}
