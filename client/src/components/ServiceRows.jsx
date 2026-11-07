import CardImage from './CardImage.jsx';
import StatusBadge from './StatusBadge.jsx';

// Editorial list: one ruled row per service rather than a wall of identical cards.
export default function ServiceRows({ services }) {
  return (
    <ul className="svc-rows">
      {services.map((s) => (
        <li key={s.id} className="svc-row">
          <div className="svc-row__title">
            <h3>{s.title}</h3>
            <StatusBadge status={s.status} />
          </div>
          <p className="svc-row__text">{s.summary}</p>
          <div className="svc-row__thumb"><CardImage image={s.image} seed={s.title} w={360} h={240} /></div>
        </li>
      ))}
    </ul>
  );
}
