import { useSearchParams } from 'react-router-dom';
import { useContent } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import PageHero from '../components/PageHero.jsx';
import SubmissionForm from '../components/SubmissionForm.jsx';
import { isExternal } from '../lib/text.js';

export default function Contact() {
  const hero = useContent('contact.hero');
  const form = useContent('contact.form');
  const site = useContent('site');
  const [params] = useSearchParams();
  usePageMeta('Contact', hero.subtitle);

  const service = params.get('service') || '';
  const socials = (site.socials || []).filter((s) => s.handle || s.url);

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="band band--light">
        <div className="wrap split split--form">
          <aside className="contact-card">
            <h2>Reach us directly</h2>
            <dl>
              {site.email && (<><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></>)}
              {site.phone && (<><dt>Phone</dt><dd><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></dd></>)}
              {site.location && (<><dt>Location</dt><dd>{site.location}</dd></>)}
              {socials.length > 0 && (
                <>
                  <dt>Follow</dt>
                  <dd>
                    <ul className="contact-card__social">
                      {socials.map((s) => (
                        <li key={s.label}>
                          {s.url ? <a href={s.url} {...(isExternal(s.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{s.label}: {s.handle}</a> : <span>{s.label}: {s.handle}</span>}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          </aside>
          <div>
            <h2>{form.title}</h2>
            <SubmissionForm
              key={params.toString()}
              topics
              initialTopic={params.get('topic') || 'contact'}
              initial={service ? { subject: `Request: ${service}` } : {}}
              extras={['organisation', 'phone', 'subject']}
              successMessage={form.successMessage}
            />
          </div>
        </div>
      </section>
    </>
  );
}
