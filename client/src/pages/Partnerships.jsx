import { useContent, useSite } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import SubmissionForm from '../components/SubmissionForm.jsx';
import CardImage from '../components/CardImage.jsx';

export default function Partnerships() {
  const { data } = useSite();
  const hero = useContent('partnerships.hero');
  const ways = useContent('partnerships.ways');
  const partners = useContent('partnerships.partners');
  const form = useContent('partnerships.form');
  usePageMeta('Partnerships', hero.subtitle);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      <section className="band band--light">
        <div className="wrap">
          <h2 className="center-head">{ways.title}</h2>
          <ul className="values values--light">
            {(ways.items || []).map((w) => <li key={w.title}><h3>{w.title}</h3><p>{w.text}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="band band--dark">
        <div className="wrap">
          <h2 className="center-head">{partners.title}</h2>
          {data.partners.length === 0 ? (
            <p className="empty empty--dark">{partners.empty}</p>
          ) : (
            <ul className="partners">
              {data.partners.map((p) => (
                <li key={p.id}>
                  {p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer" aria-label={p.name}><PartnerMark p={p} /></a> : <PartnerMark p={p} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="band band--light" id="enquire">
        <div className="wrap split split--form">
          <div>
            <h2>{form.title}</h2>
            <p className="lead lead--dark">{form.subtitle}</p>
          </div>
          <SubmissionForm type="partnership" extras={['organisation', 'phone']} messageLabel="How would you like to work with us?" submitLabel="Send enquiry" successMessage={form.successMessage} />
        </div>
      </section>
    </>
  );
}

function PartnerMark({ p }) {
  return (
    <span className="partner">
      {p.logo?.url ? <CardImage image={p.logo} alt={p.name} w={320} h={160} /> : <span className="partner__name">{p.name}</span>}
      <span className="partner__type">{p.type}</span>
    </span>
  );
}
