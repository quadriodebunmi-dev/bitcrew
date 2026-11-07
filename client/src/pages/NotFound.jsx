import { LinkButton } from '../components/Button.jsx';
import { usePageMeta } from '../lib/meta.js';
import { BitMark } from '../components/Logo.jsx';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <section className="band band--dark notfound">
      <div className="wrap wrap--narrow">
        <BitMark size={56} />
        <h1>404: this node is not on the network</h1>
        <p>The page you are looking for has moved or never existed.</p>
        <LinkButton to="/" arrow>Back to home</LinkButton>
      </div>
    </section>
  );
}
