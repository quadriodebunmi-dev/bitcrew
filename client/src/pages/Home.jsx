import { Link } from 'react-router-dom';
import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import Hero from '../sections/Hero.jsx';
import SphereGallery from '../sections/SphereGallery.jsx';
import Videos from '../sections/Videos.jsx';
import PeopleGrid from '../components/PeopleGrid.jsx';
import ServiceRows from '../components/ServiceRows.jsx';
import CtaBand from '../components/CtaBand.jsx';
import Counter from '../components/Counter.jsx';
import Prose from '../components/Prose.jsx';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const { data } = useSite();
  const hero = useContent('home.hero');
  const welcome = useContent('home.welcome');
  const servicesIntro = useContent('home.services');
  const gallery = useContent('home.gallery');
  const approach = useContent('home.approach');
  const videosIntro = useContent('home.videos');
  const teamIntro = useContent('home.team');
  const stats = useContent('home.stats');
  const cta = useContent('home.cta');
  usePageMeta('');

  return (
    <>
      <Hero content={hero} gallery={data.gallery} />

      <section className="band band--dark welcome">
        <div className="wrap welcome__grid">
          <h2>{welcome.title}</h2>
          <Prose text={welcome.body} />
        </div>
      </section>

      <section className="band band--light">
        <div className="wrap">
          <div className="sechead">
            <h2>{servicesIntro.title}</h2>
            <div>
              <p>{servicesIntro.subtitle}</p>
              <Link className="textlink" to="/services">{servicesIntro.linkLabel || 'See all services'} <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
          <ServiceRows services={data.services} />
        </div>
      </section>

      <SphereGallery content={gallery} items={data.gallery} services={data.services} />

      <section className="band band--light">
        <div className="wrap">
          <div className="sechead">
            <h2>{approach.title}</h2>
            <p>{approach.subtitle}</p>
          </div>
          <ol className="steps">
            {(approach.steps || []).map((s, i) => (
              <li key={s.title}>
                <span className="steps__node">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Videos content={videosIntro} videos={data.videos} />

      {(stats.items || []).length > 0 && (
        <section className="band band--blue stats">
          <div className="wrap">
            <h2>{stats.title}</h2>
            <dl className="stats__grid">
              {stats.items.map((s, i) => (
                <div key={i} className="stats__item">
                  <dt className="stats__num"><Counter value={s.value} suffix={s.suffix} /></dt>
                  <dd>
                    {s.label}
                    {s.note && <span className="stats__note">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {data.team.length > 0 && (
        <section className="band band--light">
          <div className="wrap">
            <div className="sechead">
              <h2>{teamIntro.title}</h2>
              <div>
                {teamIntro.subtitle && <p>{teamIntro.subtitle}</p>}
                <Link className="textlink" to="/team">{teamIntro.linkLabel || 'Meet the team'} <Icon name="arrow" size={16} /></Link>
              </div>
            </div>
            <PeopleGrid people={data.team} limit={4} />
          </div>
        </section>
      )}

      <CtaBand content={cta} items={data.gallery} />
    </>
  );
}
