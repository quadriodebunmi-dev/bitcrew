import { paragraphs } from '../lib/text.js';

export default function Prose({ text, className = '' }) {
  return (
    <div className={`prose ${className}`.trim()}>
      {paragraphs(text).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}
