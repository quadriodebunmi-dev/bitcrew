// Ask Cloudinary for a right-sized, auto-format copy of an image instead of the full original.
export function imgUrl(image, { w, h, crop = 'fill' } = {}) {
  const url = typeof image === 'string' ? image : image?.url;
  if (!url) return '';
  if (!url.includes('/image/upload/')) return url;
  const t = ['f_auto', 'q_auto'];
  if (w) t.push(`w_${w}`);
  if (h) t.push(`h_${h}`);
  if (w || h) t.push(`c_${crop}`, ...(crop === 'fill' ? ['g_auto'] : []));
  return url.replace('/image/upload/', `/image/upload/${t.join(',')}/`);
}
