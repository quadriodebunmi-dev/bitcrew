import { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LinkButton } from '../components/Button.jsx';
import CardImage from '../components/CardImage.jsx';

gsap.registerPlugin(ScrollTrigger);

// Eight cards in an arch: outer cards are smaller, lower and tilted away from the centre.
const FAN = [
  { w: 128, h: 172, rot: -9, y: 44, depth: 14 },
  { w: 156, h: 210, rot: -6, y: 24, depth: 11 },
  { w: 188, h: 252, rot: -3, y: 8, depth: 9 },
  { w: 216, h: 292, rot: -1, y: 0, depth: 6 },
  { w: 216, h: 292, rot: 1, y: 0, depth: 6 },
  { w: 188, h: 252, rot: 3, y: 8, depth: 9 },
  { w: 156, h: 210, rot: 6, y: 24, depth: 11 },
  { w: 128, h: 172, rot: 9, y: 44, depth: 14 },
];
const TILE_LABELS = ['Design', 'Code', 'Media', 'Learn', 'Create', 'Connect', 'Build', 'Share'];
// Network line: the nodes sit on the path's vertices.
const NODES = [[120, 30], [300, 14], [480, 44], [720, 44], [900, 14], [1080, 30]];
const NET_PATH = `M0 30 L${NODES.map((n) => n.join(' ')).join(' L')} L1200 30`;

export default function Hero({ content, gallery }) {
  const root = useRef(null);
  const words = (content.title || '').split(/\s+/).filter(Boolean);
  const ghost = (content.ghostWord || '').split('');

  // Photos marked "show in hero" first, then any other photos, then generated tiles.
  const cards = useMemo(() => {
    const picked = gallery.filter((g) => g.showInHero);
    const rest = gallery.filter((g) => !g.showInHero);
    return FAN.map((_, i) => [...picked, ...rest][i] || null);
  }, [gallery]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root);
      const cardEls = q('.fan__card');
      const tilts = q('.fan__tilt');

      // Starting poses are set before the first paint, so there is no flash of final content.
      gsap.set(q('.hero__word > span'), { yPercent: 115 });
      gsap.set(q('.hero__ghost span'), { y: 90, opacity: 0 });
      gsap.set(q('.hero__net-line'), { strokeDashoffset: 1 });
      gsap.set(q('.hero__net-node'), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(cardEls, { y: -720, opacity: 0, scale: 0.7, rotation: (i) => FAN[i].rot + 22 });
      gsap.set(q('.hero__fade'), { opacity: 0, y: 18 });

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(q('.hero__word > span'), { yPercent: 0, duration: 0.9, stagger: 0.07 }, 0.1)
        .to(q('.hero__ghost span'), { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: 'back.out(1.5)' }, 0.25)
        .to(q('.hero__net-line'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.6)
        .to(q('.hero__net-node'), { scale: 1, duration: 0.5, stagger: 0.14, ease: 'back.out(2.4)' }, 0.8)
        .to(cardEls, { y: (i) => FAN[i].y, opacity: 1, scale: 1, rotation: (i) => FAN[i].rot, duration: 1.1, stagger: { each: 0.08, from: 'center' }, ease: 'back.out(1.35)' }, 0.8)
        .to(q('.hero__fade'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.7);

      // Leaving the hero: the fan spreads and drops, the ghost word swells.
      gsap.to(tilts, {
        x: (i) => (i - 3.5) * 26, y: 90, rotation: (i) => (i - 3.5) * 2.5, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
      gsap.to(q('.hero__ghost'), {
        scale: 1.18, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });

      // Pointer parallax (mouse and trackpad only) plus a tilt on the hovered card.
      const cleanups = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const m = { x: 0, y: 0, tx: 0, ty: 0 };
        const onMove = (e) => {
          const r = root.current.getBoundingClientRect();
          m.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          m.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        const onLeave = () => { m.x = 0; m.y = 0; };
        const tick = () => {
          m.tx += (m.x - m.tx) * 0.06;
          m.ty += (m.y - m.ty) * 0.06;
          cardEls.forEach((el, i) => { el.style.translate = `${m.tx * FAN[i].depth}px ${m.ty * FAN[i].depth * 0.5}px`; });
        };
        root.current.addEventListener('pointermove', onMove);
        root.current.addEventListener('pointerleave', onLeave);
        gsap.ticker.add(tick);
        cleanups.push(() => {
          root.current?.removeEventListener('pointermove', onMove);
          root.current?.removeEventListener('pointerleave', onLeave);
          gsap.ticker.remove(tick);
        });

        tilts.forEach((el) => {
          const move = (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(el, { rotationX: -py * 16, rotationY: px * 16, scale: 1.1, duration: 0.4, ease: 'power2.out', transformPerspective: 700, overwrite: 'auto' });
          };
          const out = () => gsap.to(el, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', out);
          cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', out); });
        });
      }
      return () => cleanups.forEach((fn) => fn());
    }, root);
    return () => mm.revert();
  }, []);

  const primary = content.primaryCta || {};
  const secondary = content.secondaryCta || {};

  return (
    <section className="hero" ref={root}>
      <div className="hero__ghost" aria-hidden="true">
        {ghost.map((ch, i) => <span key={i}>{ch}</span>)}
      </div>

      <div className="hero__inner">
        <h1 className="hero__title">
          {words.map((w, i) => (
            <span key={i}>
              <span className="hero__word"><span>{w}</span></span>{' '}
            </span>
          ))}
        </h1>

        <svg className="hero__net" viewBox="0 0 1200 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path className="hero__net-line" d={NET_PATH} pathLength="1" />
          {NODES.map(([x, y]) => <circle key={x} className="hero__net-node" cx={x} cy={y} r="6" />)}
        </svg>

        <div className="fan">
          {FAN.map((spec, i) => (
            <div key={i} className="fan__card" style={{ '--w': `${spec.w}px`, '--h': `${spec.h}px`, '--delay': `${(i % 4) * -1.1}s` }}>
              <div className="fan__float">
                <div className="fan__tilt">
                  <CardImage image={cards[i]?.image} seed={`hero-${i}`} label={cards[i]?.title || TILE_LABELS[i]} alt={cards[i]?.title || ''} w={420} h={560} eager />
                </div>
              </div>
            </div>
          ))}
        </div>

        {content.subtitle && <p className="hero__sub hero__fade">{content.subtitle}</p>}
        <div className="hero__cta hero__fade">
          {primary.label && <LinkButton to={primary.link || '/services'} arrow>{primary.label}</LinkButton>}
          {secondary.label && <LinkButton to={secondary.link || '/community'} variant="outline">{secondary.label}</LinkButton>}
        </div>
        {content.note && <p className="hero__note hero__fade">{content.note}</p>}
      </div>
    </section>
  );
}
