import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import CardImage from '../components/CardImage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LinkButton } from '../components/Button.jsx';

const TYPE = { academy: 'Academy', webinar: 'Webinar or event', workshop: 'Workshop', outreach: 'Outreach' };

export default function Academy() {
  const { data } = useSite();
  const hero = useContent('academy.hero');
  const notice = useContent('academy.notice');
  const interest = useContent('academy.interest');
  usePageMeta('Academy and learning', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--light">
        <div className="wrap">
          {notice.text && <p className="notice">{notice.text}</p>}
          {data.programs.length === 0 ? (
            <p className="empty">{notice.empty}</p>
          ) : (
            <ul className="programs">
              {data.programs.map((p) => (
                <li key={p.id} className="program">
                  <div className="program__media"><CardImage image={p.image} seed={p.title} w={720} h={480} /></div>
                  <div className="program__body">
                    <div className="program__meta">
                      <StatusBadge status={p.status} />
                      <span>{TYPE[p.type] || p.type}</span>
                      {p.date && <span>{p.date}</span>}
                    </div>
                    <h2>{p.title}</h2>
                    <p>{p.summary}</p>
                    {p.link && p.status !== 'past' && <LinkButton to={p.link} variant="dark" arrow>{p.linkLabel || 'Find out more'}</LinkButton>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="band band--dark cta cta--plain">
        <div className="cta__box">
          <h2>{interest.title}</h2>
          <p>{interest.subtitle}</p>
          <LinkButton to="/community#join" arrow className="btn--lg">{interest.buttonLabel || 'Join the community'}</LinkButton>
        </div>
      </section>
    </>
  );
}
