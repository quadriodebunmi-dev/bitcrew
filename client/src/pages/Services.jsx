import { Link } from 'react-router-dom';
import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import CardImage from '../components/CardImage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LinkButton } from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';

export default function Services() {
  const { data } = useSite();
  const hero = useContent('services.hero');
  const notice = useContent('services.notice');
  const cta = useContent('services.cta');
  usePageMeta('Services', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--light">
        <div className="wrap">
          {notice.text && <p className="notice">{notice.text}</p>}
          <div className="features">
            {data.services.map((s) => (
              <article key={s.id} className="feature">
                <div className="feature__media"><CardImage image={s.image} seed={s.title} w={720} h={540} /></div>
                <div className="feature__body">
                  <StatusBadge status={s.status} />
                  <h2>{s.title}</h2>
                  <p>{s.summary}</p>
                  {s.features?.length > 0 && (
                    <ul className="checklist checklist--tight">
                      {s.features.map((f) => <li key={f}><Icon name="check" size={16} strokeWidth={2.4} /><span>{f}</span></li>)}
                    </ul>
                  )}
                  {s.status === 'available' ? (
                    <Link className="textlink" to={`/contact?topic=service&service=${encodeURIComponent(s.title)}`}>Request this service <Icon name="arrow" size={16} /></Link>
                  ) : s.status === 'community' ? (
                    <Link className="textlink" to="/community">Join the community <Icon name="arrow" size={16} /></Link>
                  ) : null}
                </div>
              </article>
            ))}
            {data.services.length === 0 && <p className="empty">Services will be listed here soon.</p>}
          </div>
        </div>
      </section>
      <section className="band band--dark cta cta--plain">
        <div className="cta__box">
          <h2>{cta.title}</h2>
          <p>{cta.subtitle}</p>
          <LinkButton to="/contact?topic=service" arrow className="btn--lg">{cta.buttonLabel || 'Request a service'}</LinkButton>
        </div>
      </section>
    </>
  );
}
