import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import PeopleGrid from '../components/PeopleGrid.jsx';
import { LinkButton } from '../components/Button.jsx';

export default function Team() {
  const { data } = useSite();
  const hero = useContent('team.hero');
  usePageMeta('Team', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--light">
        <div className="wrap">
          {data.team.length === 0 ? <p className="empty">Our team will be introduced here soon.</p> : <PeopleGrid people={data.team} />}
        </div>
      </section>
      <section className="band band--dark cta cta--plain">
        <div className="cta__box">
          <h2>Want to join the crew?</h2>
          <p>You do not have to know everything first. You need curiosity, commitment and a willingness to contribute.</p>
          <LinkButton to="/community#join" arrow className="btn--lg">Join the community</LinkButton>
        </div>
      </section>
    </>
  );
}
