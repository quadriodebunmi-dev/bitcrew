import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { FieldSet } from './fields/FieldRenderer.jsx';
import { useAdminData, useGuard } from './useApi.js';
import { useToast } from './toast.jsx';
import { Button } from '../components/Button.jsx';

export default function ContentEditor() {
  const { schema } = useOutletContext();
  const { key } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const guard = useGuard(toast);
  const { data, loading, error, reload, setData } = useAdminData('/admin/content');
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const section = schema.sections.find((s) => s.key === key);
  const groups = useMemo(() => {
    const map = new Map();
    schema.sections.forEach((s) => map.set(s.page, [...(map.get(s.page) || []), s]));
    return [...map.entries()];
  }, [schema]);

  useEffect(() => {
    if (data && section) {
      setDraft(structuredClone(data.content[section.key]));
      setDirty(false);
    }
  }, [data, section?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!key) return <Navigate to={`/admin/content/${schema.sections[0].key}`} replace />;
  if (!section) return <Navigate to="/admin/content" replace />;

  const customised = data?.customised?.includes(section.key);
  const guardNav = (e) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault();
  };

  async function save() {
    setSaving(true);
    const r = await guard(() => api.put(`/admin/content/${section.key}`, { data: draft }), 'Saved. The website now shows your changes.');
    setSaving(false);
    if (r) {
      setData({ content: { ...data.content, [section.key]: r.data }, customised: [...new Set([...(data.customised || []), section.key])] });
      setDirty(false);
    }
  }

  async function reset() {
    if (!window.confirm('Reset this section to the original copy? Images you uploaded here will be deleted.')) return;
    const r = await guard(() => api.del(`/admin/content/${section.key}`), 'Section reset to the original copy.');
    if (r) {
      setData({ content: { ...data.content, [section.key]: r.data }, customised: (data.customised || []).filter((k) => k !== section.key) });
      setDirty(false);
    }
  }

  return (
    <div className="page page--editor">
      <h1>Page content</h1>
      <div className="editor">
        <nav className="editor__nav" aria-label="Sections">
          {groups.map(([page, sections]) => (
            <div key={page}>
              <p className="admin__group">{page}</p>
              {sections.map((s) => (
                <NavLink key={s.key} to={`/admin/content/${s.key}`} onClick={guardNav}>
                  {s.label}{data?.customised?.includes(s.key) && <span className="dot" title="Edited" />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <section className="panel editor__form" aria-live="polite">
          {error ? (
            <div className="callout callout--warn" role="alert">{error.message} <button className="abtn" onClick={reload}>Try again</button></div>
          ) : loading || !draft ? (
            <p className="muted">Loading…</p>
          ) : (
            <>
              <div className="panel__head">
                <div>
                  <h2>{section.label}</h2>
                  <p className="muted">{section.page}{customised ? ' · edited' : ' · original copy'}</p>
                </div>
              </div>
              {section.help && <p className="callout">{section.help}</p>}
              <FieldSet fields={section.fields} value={draft} folder="content" onChange={(v) => { setDraft(v); setDirty(true); }} />
              <div className="savebar">
                <Button onClick={save} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save changes'}</Button>
                {dirty && <span className="muted">Unsaved changes</span>}
                {customised && <button className="abtn abtn--quiet savebar__reset" onClick={reset} disabled={saving}>Reset to original</button>}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
