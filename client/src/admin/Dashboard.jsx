import { Link, useOutletContext } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { formatDate } from '../lib/text.js';

const TYPE = { contact: 'General', service: 'Service request', partnership: 'Partnership', community: 'Community' };

export default function Dashboard() {
  const { schema, stats } = useOutletContext();

  return (
    <div className="page">
      <h1>Overview</h1>

      {!schema.cloudinary && (
        <div className="callout callout--warn" role="alert">
          <strong>Image uploads are not set up.</strong> Add your Cloudinary details (<code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>, <code>CLOUDINARY_API_SECRET</code>) to <code>server/.env</code> and restart the server.
        </div>
      )}

      {!stats ? <p className="muted">Loading figures…</p> : (
        <>
          <ul className="tiles">
            <li className={stats.submissions.unread ? 'tile tile--hot' : 'tile'}>
              <Link to="/admin/inbox"><strong>{stats.submissions.unread}</strong><span>Unread messages</span></Link>
            </li>
            {Object.entries(stats.entries).map(([kind, n]) => (
              <li key={kind} className="tile">
                <Link to={`/admin/collection/${kind}`}><strong>{n}</strong><span>{schema.entities[kind].label}</span></Link>
              </li>
            ))}
          </ul>

          <section className="panel">
            <div className="panel__head">
              <h2>Latest messages</h2>
              <Link to="/admin/inbox" className="textlink">Open inbox <Icon name="arrow" size={14} /></Link>
            </div>
            {stats.recent.length === 0 ? <p className="muted">Nothing yet. Messages from the website forms will appear here.</p> : (
              <ul className="recent">
                {stats.recent.map((s) => (
                  <li key={s.id} className={s.status === 'new' ? 'is-new' : ''}>
                    <div><strong>{s.name}</strong> <span className="muted">{s.email}</span></div>
                    <div className="muted">{TYPE[s.type]} · {formatDate(s.createdAt)}</div>
                    <p>{(s.message || '').slice(0, 140)}{(s.message || '').length > 140 ? '…' : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2>Where to change things</h2>
            <ul className="help">
              <li><Link to="/admin/content">Page content</Link>: headings, subtitles, buttons, copy, header images, contact details and social links.</li>
              <li><Link to="/admin/collection/gallery">Gallery</Link>: photos for the hero cards and the rotating gallery.</li>
              <li><Link to="/admin/collection/services">Services</Link> and <Link to="/admin/collection/programs">Academy</Link>: mark each as available, community, coming soon or planned.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
