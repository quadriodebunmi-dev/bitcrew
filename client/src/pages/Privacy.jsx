import { useContent } from '../context/SiteContext.jsx';
import { usePageMeta } from '../lib/meta.js';
import Prose from '../components/Prose.jsx';

export default function Privacy() {
  const c = useContent('privacy');
  usePageMeta(c.title);
  return (
    <section className="band band--light legal">
      <div className="wrap wrap--narrow">
        <h1>{c.title}</h1>
        {c.updated && <p className="legal__date">Last updated {c.updated}</p>}
        <Prose text={c.body} />
      </div>
    </section>
  );
}
