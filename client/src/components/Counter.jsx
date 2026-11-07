import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../lib/hooks.js';

// Counts up once, when scrolled into view.
export default function Counter({ value = 0, suffix = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) { setShown(value); return undefined; }
    const el = ref.current;
    let tween;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const o = { v: 0 };
        tween = gsap.to(o, { v: value, duration: 1.8, ease: 'power2.out', onUpdate: () => setShown(Math.round(o.v)) });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => { io.disconnect(); tween?.kill(); };
  }, [value, reduced]);

  return (
    <span ref={ref} aria-label={`${value.toLocaleString()}${suffix}`}>
      <span aria-hidden="true">{shown.toLocaleString()}{suffix}</span>
    </span>
  );
}
