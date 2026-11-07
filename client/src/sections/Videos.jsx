import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { youtubeThumb } from '../lib/youtube.js';

export default function Videos({ content, videos }) {
  const [current, setCurrent] = useState(0);
  if (!videos.length) return null;
  const v = videos[Math.min(current, videos.length - 1)];

  return (
    <section className="band band--dark videos">
      <div className="wrap">
        <div className="sechead">
          <h2>{content.title}</h2>
          <div>
            {content.subtitle && <p>{content.subtitle}</p>}
            <Link className="textlink" to="/videos">{content.linkLabel || 'See all videos'} <Icon name="arrow" size={16} /></Link>
          </div>
        </div>
        <div className={`videos__grid ${videos.length > 1 ? 'has-list' : ''}`}>
          <div className="videos__main">
            <VideoPlayer key={v.id} url={v.youtube} title={v.title} />
            <h3>{v.title}</h3>
            {v.description && <p>{v.description}</p>}
          </div>
          {videos.length > 1 && (
            <ul className="videos__list" aria-label="More videos">
              {videos.map((x, i) => (
                <li key={x.id}>
                  <button type="button" className={i === current ? 'is-active' : ''} aria-current={i === current} onClick={() => setCurrent(i)}>
                    <img src={youtubeThumb(x.youtube)} alt="" loading="lazy" />
                    <span>{x.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
