import { useContent } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import SubmissionForm from '../components/SubmissionForm.jsx';

export default function Community() {
  const hero = useContent('community.hero');
  const audience = useContent('community.audience');
  const benefits = useContent('community.benefits');
  const join = useContent('community.join');
  usePageMeta('Community', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      <section className="band band--light">
        <div className="wrap split">
          <div>
            <h2>{audience.title}</h2>
            {audience.belief && <p className="statement statement--sm">{audience.belief}</p>}
          </div>
          <ul className="tags">
            {(audience.items || []).map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section className="band band--dark">
        <div className="wrap">
          <h2 className="center-head">{benefits.title}</h2>
          <ul className="values values--four">
            {(benefits.items || []).map((b) => <li key={b.title}><h3>{b.title}</h3><p>{b.text}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="band band--light" id="join">
        <div className="wrap split split--form">
          <div>
            <h2>{join.title}</h2>
            <p className="lead lead--dark">{join.subtitle}</p>
          </div>
          <SubmissionForm
            type="community"
            skills={join.skills}
            extras={['phone']}
            messageLabel="Anything you would like us to know"
            messageRequired={false}
            submitLabel="Join the crew"
            successMessage={join.successMessage}
          />
        </div>
      </section>
    </>
  );
}
