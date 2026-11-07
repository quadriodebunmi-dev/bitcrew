import { useId, useMemo } from 'react';

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A generated "bit grid" tile. It stands in for a photo whenever none has been uploaded,
// so empty galleries still look intentional. Same seed = same tile.
export default function BitTile({ seed = 'bitcrew', label = '' }) {
  const gid = useId().replace(/:/g, '');
  const cells = useMemo(() => {
    const rnd = mulberry32(hash(seed));
    const out = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 6; c++) {
        const v = rnd();
        if (v > 0.58) out.push({ r, c, o: 0.14 + rnd() * 0.6, glyph: v > 0.93 ? (rnd() > 0.5 ? '1' : '0') : null });
      }
    }
    return out;
  }, [seed]);
  const tilt = 200 + Math.round(mulberry32(hash(seed + 'h'))() * 24);

  return (
    <div className="bittile">
      <svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${tilt} 90% 46%)`} />
            <stop offset="1" stopColor="#0A1646" />
          </linearGradient>
        </defs>
        <rect width="120" height="160" fill={`url(#${gid})`} />
        {cells.map(({ r, c, o, glyph }) =>
          glyph ? (
            <text key={`${r}-${c}`} x={c * 20 + 10} y={r * 20 + 15} textAnchor="middle" fontSize="12" fill="#CFE0FF" opacity={o + 0.2} fontFamily="Unbounded, sans-serif">
              {glyph}
            </text>
          ) : (
            <rect key={`${r}-${c}`} x={c * 20 + 2} y={r * 20 + 2} width="16" height="16" rx="3" fill="#8FB1FF" opacity={o} />
          )
        )}
      </svg>
      {label && <span className="bittile__label">{label}</span>}
    </div>
  );
}
