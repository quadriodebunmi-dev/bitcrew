// Mirrors server/src/lib/fields.js youtubeId().
export function youtubeId(v) {
  const s = (v || '').trim();
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

export const youtubeThumb = (v) => {
  const id = youtubeId(v);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
};
