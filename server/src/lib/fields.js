// A tiny field-schema engine shared by validation (server) and the admin forms (client).
// The same schema objects are sent to the dashboard, so forms and validation never drift apart.

const base = (type) => (key, label, extra = {}) => ({ key, label, type, ...extra });

export const f = {
  text: base('text'),
  textarea: (key, label, extra = {}) => ({ key, label, type: 'textarea', rows: 4, ...extra }),
  url: base('url'),
  email: base('email'),
  number: base('number'),
  bool: base('boolean'),
  youtube: base('youtube'),
  image: base('image'),
  images: base('images'),
  strings: base('stringlist'),
  list: (key, label, fields, extra = {}) => ({ key, label, type: 'list', fields, ...extra }),
  group: (key, label, fields, extra = {}) => ({ key, label, type: 'group', fields, ...extra }),
  select: (key, label, options, extra = {}) => ({
    key,
    label,
    type: 'select',
    options: options.map(([value, text]) => ({ value, label: text })),
    ...extra,
  }),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const clip = (v, max) =>
  (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/\u0000/g, '').trim().slice(0, max);

export const isEmail = (v) => typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);

// Only allow links that cannot run script. Blocks javascript:, data:, vbscript: etc.
export function safeUrl(v) {
  const s = clip(v, 500);
  if (!s) return '';
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(s) ? s : '';
}

// Accepts watch, youtu.be, embed, shorts and live links (or a bare 11-character ID) and returns the video ID.
export function youtubeId(v) {
  const s = clip(v, 300);
  if (!s) return '';
  if (/^[\w-]{11}$/.test(s)) return s;
  let u;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); } catch { return ''; }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  let id = '';
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
    else id = (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/) || [])[1] || '';
  }
  return /^[\w-]{11}$/.test(id) ? id : '';
}

function sanitizeImage(v) {
  if (!v || typeof v !== 'object') return null;
  const url = clip(v.url, 600);
  if (!/^https:\/\//i.test(url)) return null;
  const num = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
  return {
    url,
    publicId: clip(v.publicId, 300),
    width: num(v.width),
    height: num(v.height),
    alt: clip(v.alt, 200),
  };
}

export function isBlank(v) {
  if (v == null || v === '' || v === false || v === 0) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.values(v).every(isBlank);
  return false;
}

export function blank(field) {
  switch (field.type) {
    case 'number': return 0;
    case 'boolean': return false;
    case 'select': return field.default ?? field.options[0].value;
    case 'image': return null;
    case 'images':
    case 'stringlist':
    case 'list': return [];
    case 'group': return Object.fromEntries(field.fields.map((c) => [c.key, blank(c)]));
    default: return '';
  }
}

export function sanitizeField(field, v) {
  switch (field.type) {
    case 'text': return clip(v, field.max || 300);
    case 'textarea': return clip(v, field.max || 8000);
    case 'email': { const s = clip(v, 254).toLowerCase(); return isEmail(s) ? s : ''; }
    case 'url': return safeUrl(v);
    case 'number': { const n = Number(v); return Number.isFinite(n) ? n : 0; }
    case 'boolean': return v === true || v === 'true';
    case 'select': {
      const allowed = field.options.map((o) => o.value);
      return allowed.includes(v) ? v : field.default ?? allowed[0];
    }
    case 'youtube': { const id = youtubeId(v); return id ? `https://www.youtube.com/watch?v=${id}` : ''; }
    case 'image': return sanitizeImage(v);
    case 'images': return (Array.isArray(v) ? v : []).slice(0, 30).map(sanitizeImage).filter(Boolean);
    case 'stringlist':
      return (Array.isArray(v) ? v : []).slice(0, 60).map((s) => clip(s, field.max || 300)).filter(Boolean);
    case 'list':
      return (Array.isArray(v) ? v : [])
        .slice(0, 60)
        .map((item) => sanitizeObject(field.fields, item))
        .filter((item) => !isBlank(item));
    case 'group': return sanitizeObject(field.fields, v);
    default: return null;
  }
}

export function sanitizeObject(fields, input) {
  const src = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(fields.map((fl) => [fl.key, sanitizeField(fl, src[fl.key])]));
}

// Stored value wins when present; otherwise fall back to the default; otherwise blank.
export function resolveObject(fields, stored, defaults) {
  const out = {};
  for (const fl of fields) {
    const has = stored && Object.prototype.hasOwnProperty.call(stored, fl.key);
    if (fl.type === 'group') {
      out[fl.key] = resolveObject(fl.fields, has ? stored[fl.key] : null, defaults?.[fl.key]);
    } else if (has) {
      out[fl.key] = stored[fl.key];
    } else if (defaults && defaults[fl.key] !== undefined) {
      out[fl.key] = defaults[fl.key];
    } else {
      out[fl.key] = blank(fl);
    }
  }
  return out;
}

export function missingRequired(fields, data) {
  return fields.filter((fl) => fl.required && isBlank(data[fl.key])).map((fl) => fl.label);
}

// Walk any value and collect Cloudinary public IDs of images inside it.
export function collectPublicIds(value, acc = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => collectPublicIds(v, acc));
  else if (value && typeof value === 'object') {
    if (typeof value.publicId === 'string' && value.publicId && value.url) acc.add(value.publicId);
    Object.values(value).forEach((v) => collectPublicIds(v, acc));
  }
  return acc;
}

export function removedPublicIds(before, after) {
  const prev = collectPublicIds(before);
  const next = collectPublicIds(after);
  return [...prev].filter((id) => !next.has(id));
}
