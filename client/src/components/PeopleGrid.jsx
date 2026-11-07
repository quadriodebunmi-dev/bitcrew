import CardImage from './CardImage.jsx';
import { initials } from '../lib/text.js';

export default function PeopleGrid({ people, limit }) {
  const list = limit ? people.slice(0, limit) : people;
  return (
    <ul className="people">
      {list.map((p) => (
        <li key={p.id} className="person">
          <div className="person__photo">
            {p.photo?.url ? <CardImage image={p.photo} alt={p.name} w={480} h={560} /> : <span className="person__initials" aria-hidden="true">{initials(p.name)}</span>}
          </div>
          <h3>{p.name}</h3>
          {p.role && <p className="person__role">{p.role}</p>}
          {p.bio && <p>{p.bio}</p>}
          {(p.links || []).length > 0 && (
            <p className="person__links">
              {p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
