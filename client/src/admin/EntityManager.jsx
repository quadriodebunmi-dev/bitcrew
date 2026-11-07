import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { FieldSet, blank } from './fields/FieldRenderer.jsx';
import { useAdminData, useGuard } from './useApi.js';
import { useToast } from './toast.jsx';
import Icon from '../components/Icon.jsx';
import { imgUrl } from '../lib/image.js';
import { Button } from '../components/Button.jsx';
import { youtubeThumb } from '../lib/youtube.js';

const emptyData = (fields) => Object.fromEntries(fields.map((f) => [f.key, blank(f)]));

function badgeText(cfg, item) {
  const key = cfg.list.badge;
  if (!key) return '';
  const field = cfg.fields.find((f) => f.key === key);
  const v = item.data[key];
  if (field?.type === 'select') return field.options.find((o) => o.value === v)?.label || v;
  if (field?.type === 'boolean') return v ? 'In hero cards' : '';
  return v || '';
}

function EditDialog({ cfg, kind, editing, onClose, onSaved }) {
  const ref = useRef(null);
  const toast = useToast();
  const guard = useGuard(toast);
  const [data, setData] = useState(editing.data);
  const [published, setPublished] = useState(editing.published);
  const [saving, setSaving] = useState(false);

  useEffect(() => { ref.current?.showModal(); }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const call = editing.id
      ? () => api.put(`/admin/entries/${kind}/${editing.id}`, { data, published })
      : () => api.post(`/admin/entries/${kind}`, { data, published });
    const r = await guard(call, editing.id ? 'Saved.' : `Added ${cfg.singular}.`);
    setSaving(false);
    if (r) onSaved();
  }

  return (
    <dialog ref={ref} className="adialog" onClose={onClose} aria-labelledby="edit-title">
      <form onSubmit={save}>
        <div className="adialog__head">
          <h2 id="edit-title">{editing.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}</h2>
          <button type="button" className="iconbtn" onClick={() => ref.current?.close()} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="adialog__body">
          {cfg.help && <p className="callout">{cfg.help}</p>}
          <FieldSet fields={cfg.fields} value={data} onChange={setData} folder={kind} />
          <label className="check check--box">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span>Visible on the website</span>
          </label>
        </div>
        <div className="adialog__foot">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          <button type="button" className="abtn" onClick={() => ref.current?.close()}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
}

export default function EntityManager() {
  const { kind } = useParams();
  const { schema } = useOutletContext();
  const cfg = schema.entities[kind];
  const toast = useToast();
  const guard = useGuard(toast);
  const { data, loading, error, reload, setData } = useAdminData(`/admin/entries/${kind}`);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => setEditing(null), [kind]);

  if (!cfg) return <div className="page"><p>Unknown collection.</p></div>;
  const items = data?.items || [];

  async function togglePublished(item) {
    setBusyId(item.id);
    const r = await guard(() => api.put(`/admin/entries/${kind}/${item.id}`, { published: !item.published }));
    setBusyId(null);
    if (r) setData({ items: items.map((i) => (i.id === item.id ? r.item : i)) });
  }

  async function move(index, delta) {
    const next = [...items];
    const j = index + delta;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setData({ items: next }); // optimistic
    const r = await guard(() => api.post(`/admin/entries/${kind}/reorder`, { ids: next.map((i) => i.id) }));
    if (!r) reload();
  }

  async function remove(item) {
    const name = item.data[cfg.list.title] || cfg.singular;
    if (!window.confirm(`Delete “${name}”? Its images are deleted too. This cannot be undone.`)) return;
    setBusyId(item.id);
    const r = await guard(() => api.del(`/admin/entries/${kind}/${item.id}`), 'Deleted.');
    setBusyId(null);
    if (r) reload();
  }

  return (
    <div className="page">
      <div className="page__head">
        <h1>{cfg.label}</h1>
        <Button onClick={() => setEditing({ id: null, data: emptyData(cfg.fields), published: true })}><Icon name="plus" size={16} /> Add {cfg.singular}</Button>
      </div>
      {cfg.help && <p className="callout">{cfg.help}</p>}

      {error ? (
        <div className="callout callout--warn" role="alert">{error.message} <button className="abtn" onClick={reload}>Try again</button></div>
      ) : loading && !data ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No {cfg.label.toLowerCase()} yet.</p>
          <Button variant="outline" onClick={() => setEditing({ id: null, data: emptyData(cfg.fields), published: true })}>Add the first {cfg.singular}</Button>
        </div>
      ) : (
        <ul className="rows">
          {items.map((item, i) => {
            const thumb = item.data[cfg.list.image];
            const ytThumb = cfg.list.youtube ? youtubeThumb(item.data[cfg.list.youtube]) : '';
            const badge = badgeText(cfg, item);
            return (
              <li key={item.id} className={`row ${item.published ? '' : 'is-hidden'}`}>
                <div className="row__thumb">{thumb?.url ? <img src={imgUrl(thumb, { w: 120, h: 90 })} alt="" /> : ytThumb ? <img src={ytThumb} alt="" /> : <Icon name="image" size={20} />}</div>
                <div className="row__main">
                  <strong>{item.data[cfg.list.title] || 'Untitled'}</strong>
                  <span className="muted row__sub">{item.data[cfg.list.subtitle]}</span>
                  <span className="row__tags">
                    {badge && <span className="tag">{badge}</span>}
                    {!item.published && <span className="tag tag--off">Hidden</span>}
                  </span>
                </div>
                <div className="row__tools">
                  <button className="iconbtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" size={16} /></button>
                  <button className="iconbtn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><Icon name="down" size={16} /></button>
                  <button className="iconbtn" onClick={() => togglePublished(item)} disabled={busyId === item.id} aria-label={item.published ? 'Hide from website' : 'Show on website'} title={item.published ? 'Hide from website' : 'Show on website'}><Icon name="eye" size={16} /></button>
                  <button className="abtn" onClick={() => setEditing(item)}><Icon name="edit" size={16} /> Edit</button>
                  <button className="iconbtn iconbtn--danger" onClick={() => remove(item)} disabled={busyId === item.id} aria-label="Delete"><Icon name="trash" size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <EditDialog
          key={editing.id || 'new'}
          cfg={cfg}
          kind={kind}
          editing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}
