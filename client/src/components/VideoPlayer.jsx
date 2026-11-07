import { useState } from 'react';
import Icon from './Icon.jsx';
import { youtubeId, youtubeThumb } from '../lib/youtube.js';

// Shows a thumbnail first. The YouTube player (privacy-enhanced domain) only loads after a click,
// so the page stays fast and nothing is sent to YouTube until the visitor chooses to watch.
export default function VideoPlayer({ url, title = '' }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'Video'}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="video__poster" onClick={() => setPlaying(true)} aria-label={`Play video${title ? `: ${title}` : ''}`}>
          <img src={youtubeThumb(url)} alt="" loading="lazy" />
          <span className="video__play"><Icon name="play" size={30} strokeWidth={2} /></span>
        </button>
      )}
    </div>
  );
}
