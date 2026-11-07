import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';

export default function Videos() {
  const { data } = useSite();
  const hero = useContent('videos.hero');
  usePageMeta('Videos', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--dark vpage">
        <div className="wrap">
          {data.videos.length === 0 ? (
            <p className="empty empty--dark">{hero.empty}</p>
          ) : (
            <ul className="vgrid">
              {data.videos.map((v) => (
                <li key={v.id} className="vcard">
                  <VideoPlayer url={v.youtube} title={v.title} />
                  <h2>{v.title}</h2>
                  {v.description && <p>{v.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
