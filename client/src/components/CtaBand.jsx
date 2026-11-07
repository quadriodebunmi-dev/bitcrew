import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardImage from './CardImage.jsx';
import { LinkButton } from './Button.jsx';
import { useReducedMotion } from '../lib/hooks.js';

gsap.registerPlugin(ScrollTrigger);

const SPOTS = [
  { top: '8%', left: '6%', rot: -8 },
  { top: '16%', left: '82%', rot: 7 },
  { top: '58%', left: '3%', rot: 5 },
  { top: '66%', left: '86%', rot: -6 },
  { top: '80%', left: '28%', rot: 9 },
  { top: '6%', left: '46%', rot: -4 },
];

// Closing call to action with small cards drifting at different speeds as you scroll past.
export default function CtaBand({ content, items = [] }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const btn = content.button || {};

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.constel__card').forEach((el, i) => {
        gsap.to(el, {
          y: -60 - (i % 3) * 45, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="band band--dark cta" ref={root}>
      <div className="constel" aria-hidden="true">
        {SPOTS.map((s, i) => (
          <div key={i} className="constel__card" style={{ top: s.top, left: s.left, rotate: `${s.rot}deg` }}>
            <CardImage image={items[i]?.image} seed={`cta-${i}`} w={200} h={270} />
          </div>
        ))}
      </div>
      <div className="cta__box">
        <h2>{content.title}</h2>
        {content.subtitle && <p>{content.subtitle}</p>}
        {btn.label && <LinkButton to={btn.link || '/community'} arrow className="btn--lg">{btn.label}</LinkButton>}
      </div>
    </section>
  );
}
