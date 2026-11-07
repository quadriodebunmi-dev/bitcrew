import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardImage from '../components/CardImage.jsx';
import { useMedia, useReducedMotion } from '../lib/hooks.js';

gsap.registerPlugin(ScrollTrigger);

const COUNT = 24;
const FALLBACK = [
  { title: 'Connect', description: 'Bringing creative minds and technology enthusiasts together.' },
  { title: 'Create', description: 'Turning ideas into projects, content and digital solutions.' },
  { title: 'Collaborate', description: 'Building partnerships and working collectively.' },
];

// Fibonacci sphere: spreads points evenly. Each card faces outward from the centre.
function buildLayout(radius) {
  return Array.from({ length: COUNT }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const ry = (Math.atan2(x, z) * 180) / Math.PI;
    const rx = (Math.asin(-y / radius) * 180) / Math.PI;
    return { x, y, z, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg)` };
  });
}

export default function SphereGallery({ content, items, services }) {
  const wrap = useRef(null);
  const sphere = useRef(null);
  const caption = useRef(null);
  const frontIndex = useRef(-1);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const small = useMedia('(max-width: 700px)');
  const medium = useMedia('(max-width: 1100px)');
  const radius = small ? 150 : medium ? 240 : 320;

  // Photos if there are any; otherwise the services, so the section is never empty.
  const source = useMemo(() => {
    if (items.length) return items.map((g) => ({ title: g.title, description: g.description, image: g.image }));
    if (services.length) return services.map((s) => ({ title: s.title, description: s.summary, image: s.image }));
    return FALLBACK;
  }, [items, services]);

  const cards = useMemo(() => Array.from({ length: COUNT }, (_, i) => source[i % source.length]), [source]);
  const layout = useMemo(() => buildLayout(radius), [radius]);

  useEffect(() => {
    if (reduced) return undefined;
    const sphereEl = sphere.current;
    const els = [...sphereEl.children];
    const state = { p: 0 };

    const render = (p) => {
      const b = p * 540; // one and a half turns
      const a = 12 + p * 12; // gentle tilt
      sphereEl.style.transform = `rotateX(${a}deg) rotateY(${b}deg)`;
      const [sa, ca, sb, cb] = [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180), Math.sin((b * Math.PI) / 180), Math.cos((b * Math.PI) / 180)];
      let best = -Infinity;
      let front = 0;
      layout.forEach((l, i) => {
        const z1 = -l.x * sb + l.z * cb; // after rotateY
        const z2 = l.y * sa + z1 * ca; // after rotateX
        els[i].style.opacity = String(0.28 + 0.72 * ((z2 + radius) / (2 * radius)));
        if (z2 > best) { best = z2; front = i; }
      });
      els.forEach((el, i) => el.classList.toggle('is-front', i === front));
      if (front !== frontIndex.current) {
        frontIndex.current = front;
        setActive(front);
      }
    };

    render(0);
    const tween = gsap.to(state, {
      p: 1, ease: 'none', onUpdate: () => render(state.p),
      scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [layout, radius, reduced]);

  // Caption cross-fade when the front card changes.
  useEffect(() => {
    if (reduced || !caption.current) return;
    gsap.fromTo(caption.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  }, [active, reduced]);

  const current = cards[active] || cards[0];

  if (reduced) {
    return (
      <section className="band band--dark sphere-static">
        <div className="wrap">
          <h2>{content.title}</h2>
          {content.subtitle && <p className="lead">{content.subtitle}</p>}
          <ul className="sphere-static__grid">
            {source.slice(0, 12).map((c, i) => (
              <li key={i}>
                <div className="sphere-static__img"><CardImage image={c.image} seed={`sphere-${i}`} label={c.title} w={360} h={480} /></div>
                <strong>{c.title}</strong>
                {c.description && <p>{c.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="sphere" ref={wrap} aria-label={content.title}>
      <div className="sphere__scene">
        <div className="sphere__text">
          <h2>{content.title}</h2>
          {content.subtitle && <p className="lead">{content.subtitle}</p>}
          <div className="sphere__caption" ref={caption} aria-live="polite">
            <h3>{current.title}</h3>
            {current.description && <p>{current.description}</p>}
          </div>
        </div>
        <div className="sphere__stage" aria-hidden="true">
          <div className="sphere__ball" ref={sphere}>
            {cards.map((c, i) => (
              <div key={i} className="sphere__card" style={{ transform: layout[i].transform }}>
                <CardImage image={c.image} seed={`sphere-${i % source.length}`} label={c.title} w={300} h={400} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
