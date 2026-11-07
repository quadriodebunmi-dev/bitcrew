import { useState } from 'react';
import { api } from '../api.js';
import { useAdminData, useGuard } from './useApi.js';
import { useToast } from './toast.jsx';
import { useDebouncedValue } from '../lib/hooks.js';
import { formatDate } from '../lib/text.js';
import Icon from '../components/Icon.jsx';

const TYPES = [['', 'All types'], ['contact', 'General'], ['service', 'Service requests'], ['partnership', 'Partnerships'], ['community', 'Community']];
const STATUSES = [['', 'Active'], ['new', 'Unread'], ['archived', 'Archived'], ['all', 'Everything']];
const TYPE_LABEL = { contact: 'General enquiry', service: 'Service request', partnership: 'Partnership', community: 'Community join' };

export default function Inbox() {
  const toast = useToast();
  const guard = useGuard(toast);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const dq = useDebouncedValue(q, 300);

  const qs = new URLSearchParams({ page, ...(type && { type }), ...(status && { status }), ...(dq && { q: dq }) });
  const { data, loading, error, reload, setData } = useAdminData(`/admin/submissions?${qs}`);
  const items = data?.items || [];

  const patchLocal = (item) => {
    setData({ ...data, items: items.map((i) => (i.id === item.id ? item : i)) });
    setSelected((s) => (s?.id === item.id ? item : s));
  };

  async function open(item) {
    setSelected(item);
    if (item.status === 'new') {
      const r = await guard(() => api.patch(`/admin/submissions/${item.id}`, { status: 'read' }));
      if (r) patchLocal(r.item);
    }
  }
  async function setStatusFor(item, next) {
    const r = await guard(() => api.patch(`/admin/submissions/${item.id}`, { status: next }), next === 'archived' ? 'Archived.' : 'Updated.');
    if (r) { patchLocal(r.item); if (next === 'archived' && !status) { setSelected(null); reload(); } }
  }
  async function remove(item) {
    if (!window.confirm(`Delete the message from ${item.name}? This cannot be undone.`)) return;
    const r = await guard(() => api.del(`/admin/submissions/${item.id}`), 'Deleted.');
    if (r) { setSelected(null); reload(); }
  }

  const exportHref = api.url(`/admin/submissions/export.csv?${new URLSearchParams({ ...(type && { type }), ...(dq && { q: dq }) })}`);

  return (
    <div className="page">
      <div className="page__head">
        <h1>Inbox</h1>
        <a className="abtn" href={exportHref} download><Icon name="download" size={16} /> Export CSV</a>
      </div>

      <div className="filters">
        <div className="filters__search">
          <Icon name="search" size={16} />
          <input className="ainput" type="search" placeholder="Search name, email or message" aria-label="Search messages" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="ainput" aria-label="Filter by type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="ainput" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="inbox">
        <div className="inbox__list">
          {error ? (
            <div className="callout callout--warn" role="alert">{error.message} <button className="abtn" onClick={reload}>Try again</button></div>
          ) : loading && !data ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <div className="empty-state"><p>No messages match.</p></div>
          ) : (
            <ul className="msgs">
              {items.map((m) => (
                <li key={m.id}>
                  <button className={`msg ${m.status === 'new' ? 'is-new' : ''} ${selected?.id === m.id ? 'is-active' : ''}`} onClick={() => open(m)}>
                    <span className="msg__top"><strong>{m.name}</strong><time>{formatDate(m.createdAt)}</time></span>
                    <span className="msg__type">{TYPE_LABEL[m.type]}{m.status === 'archived' ? ' · archived' : ''}</span>
                    <span className="msg__snip">{(m.message || m.skill || '(no message)').slice(0, 90)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {data && data.pages > 1 && (
            <div className="pager">
              <button className="abtn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="muted">Page {data.page} of {data.pages}</span>
              <button className="abtn" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </div>

        <article className="inbox__detail panel" aria-live="polite">
          {!selected ? (
            <p className="muted">Select a message to read it.</p>
          ) : (
            <>
              <div className="panel__head">
                <div>
                  <h2>{selected.name}</h2>
                  <p className="muted">{TYPE_LABEL[selected.type]} · {formatDate(selected.createdAt)}</p>
                </div>
              </div>
              <dl className="kv">
                <dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd>
                {selected.phone && (<><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></>)}
                {selected.organisation && (<><dt>Organisation</dt><dd>{selected.organisation}</dd></>)}
                {selected.skill && (<><dt>Skill area</dt><dd>{selected.skill}</dd></>)}
                {selected.subject && (<><dt>Subject</dt><dd>{selected.subject}</dd></>)}
              </dl>
              {selected.message && <p className="msgbody">{selected.message}</p>}
              <div className="savebar">
                <a className="btn btn--primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Your message to BitCrew Network'}`)}`}><Icon name="mail" size={16} /> Reply by email</a>
                {selected.status === 'archived'
                  ? <button className="abtn" onClick={() => setStatusFor(selected, 'read')}>Move to inbox</button>
                  : <button className="abtn" onClick={() => setStatusFor(selected, 'archived')}>Archive</button>}
                {selected.status === 'read' && <button className="abtn abtn--quiet" onClick={() => setStatusFor(selected, 'new')}>Mark unread</button>}
                <button className="abtn abtn--quiet savebar__reset" onClick={() => remove(selected)}><Icon name="trash" size={16} /> Delete</button>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
