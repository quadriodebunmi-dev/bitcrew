import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import Prose from '../components/Prose.jsx';
import PeopleGrid from '../components/PeopleGrid.jsx';
import Icon from '../components/Icon.jsx';

export default function About() {
  const { data } = useSite();
  const hero = useContent('about.hero');
  const story = useContent('about.story');
  const meaning = useContent('about.meaning');
  const purpose = useContent('about.purpose');
  const values = useContent('about.values');
  const goals = useContent('about.goals');
  const team = useContent('about.team');
  usePageMeta('About', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      <section className="band band--light">
        <div className="wrap split">
          <h2>{story.title}</h2>
          <Prose text={story.body} />
        </div>
      </section>

      <section className="band band--dark">
        <div className="wrap">
          <h2 className="center-head">{meaning.title}</h2>
          <div className="meaning">
            {(meaning.items || []).map((m) => (
              <div key={m.term} className="meaning__item">
                <span className="meaning__term">{m.term}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          {meaning.intro && <p className="meaning__outro">{meaning.intro}</p>}
        </div>
      </section>

      <section className="band band--light">
        <div className="wrap duo">
          <div>
            <h2>Mission</h2>
            <p className="statement">{purpose.mission}</p>
          </div>
          <div>
            <h2>Vision</h2>
            <p className="statement">{purpose.vision}</p>
          </div>
        </div>
      </section>

      <section className="band band--dark">
        <div className="wrap">
          <h2 className="center-head">{values.title}</h2>
          <ul className="values">
            {(values.items || []).map((v) => (
              <li key={v.title}><h3>{v.title}</h3><p>{v.text}</p></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--light">
        <div className="wrap split">
          <div>
            <h2>{purpose.whyTitle}</h2>
          </div>
          <Prose text={purpose.whyBody} />
        </div>
      </section>

      <section className="band band--blue">
        <div className="wrap split">
          <h2>{goals.title}</h2>
          <ul className="checklist">
            {(goals.items || []).map((g) => (
              <li key={g}><Icon name="check" size={18} strokeWidth={2.4} /><span>{g}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {data.team.length > 0 && (
        <section className="band band--light">
          <div className="wrap">
            <div className="sechead"><h2>{team.title}</h2>{team.subtitle && <p>{team.subtitle}</p>}</div>
            <PeopleGrid people={data.team} />
          </div>
        </section>
      )}
    </>
  );
}
