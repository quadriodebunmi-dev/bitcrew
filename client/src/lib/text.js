export const paragraphs = (text = '') => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

export const isExternal = (href = '') => /^(https?:|mailto:|tel:)/i.test(href);

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
