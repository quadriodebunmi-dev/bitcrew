import { useRef, useState } from 'react';
import { api } from '../../api.js';
import { imgUrl } from '../../lib/image.js';
import Icon from '../../components/Icon.jsx';
import { useToast } from '../toast.jsx';
import { useAuth } from '../auth.jsx';

const MAX_MB = 8;

// Single image uploader. Uploads straight to Cloudinary (through the API) and stores {url, publicId, …}.
export default function ImageField({ value, onChange, folder = 'content', label }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { expire } = useAuth();

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return toast.error('Choose a JPG, PNG, WebP, GIF or AVIF image.');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`That image is larger than ${MAX_MB} MB.`);
    setBusy(true);
    try {
      const { image } = await api.upload(file, folder);
      onChange({ ...image, alt: value?.alt || '' });
    } catch (err) {
      if (err.status === 401) expire();
      else toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="imgfield">
      <div className={`imgfield__preview ${value?.url ? '' : 'is-empty'}`}>
        {value?.url ? <img src={imgUrl(value, { w: 320, h: 240, crop: 'limit' })} alt="" /> : <Icon name="image" size={28} />}
        {busy && <span className="imgfield__busy">Uploading…</span>}
      </div>
      <div className="imgfield__side">
        <div className="imgfield__buttons">
          <button type="button" className="abtn" onClick={() => input.current?.click()} disabled={busy} aria-label={`${value?.url ? 'Replace' : 'Upload'} ${label || 'image'}`}>
            <Icon name="upload" size={16} /> {value?.url ? 'Replace' : 'Upload'}
          </button>
          {value?.url && (
            <button type="button" className="abtn abtn--quiet" onClick={() => onChange(null)} disabled={busy}>
              <Icon name="trash" size={16} /> Remove
            </button>
          )}
        </div>
        {value?.url && (
          <input
            className="imgfield__alt"
            type="text"
            placeholder="Describe the image (alt text)"
            aria-label="Alt text"
            value={value.alt || ''}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            maxLength={200}
          />
        )}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={pick} hidden />
      </div>
    </div>
  );
}
