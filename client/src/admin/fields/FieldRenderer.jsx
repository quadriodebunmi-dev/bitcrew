import { useId } from 'react';
import Icon from '../../components/Icon.jsx';
import ImageField from './ImageField.jsx';
import { youtubeId, youtubeThumb } from '../../lib/youtube.js';

// Mirrors lib/fields.js `blank()` on the server.
export function blank(field) {
  switch (field.type) {
    case 'number': return 0;
    case 'boolean': return false;
    case 'select': return field.default ?? field.options[0].value;
    case 'image': return null;
    case 'images': case 'stringlist': case 'list': return [];
    case 'group': return Object.fromEntries(field.fields.map((c) => [c.key, blank(c)]));
    default: return '';
  }
}

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function Shell({ field, id, children, inline }) {
  return (
    <div className={`afield ${inline ? 'afield--inline' : ''}`}>
      <label className="afield__label" htmlFor={id}>
        {field.label}{field.required && <span className="afield__req" title="Required"> *</span>}
      </label>
      {children}
      {field.help && <p className="afield__help">{field.help}</p>}
    </div>
  );
}

export default function Field({ field, value, onChange, folder }) {
  const id = useId();

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
      return (
        <Shell field={field} id={id}>
          <input id={id} className="ainput" type={field.type === 'email' ? 'email' : 'text'} value={value ?? ''} maxLength={field.max || 300} onChange={(e) => onChange(e.target.value)} />
        </Shell>
      );
    case 'youtube': {
      const vid = youtubeId(value);
      return (
        <Shell field={field} id={id}>
          <input id={id} className="ainput" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={value ?? ''} maxLength={300} onChange={(e) => onChange(e.target.value)} />
          {value && !vid && <p className="afield__error">That does not look like a YouTube link.</p>}
          {vid && <img className="ytpreview" src={youtubeThumb(value)} alt="Video thumbnail" />}
        </Shell>
      );
    }
    case 'number':
      return (
        <Shell field={field} id={id}>
          <input id={id} className="ainput" type="number" value={value ?? 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
        </Shell>
      );
    case 'textarea':
      return (
        <Shell field={field} id={id}>
          <textarea id={id} className="ainput" rows={field.rows || 4} value={value ?? ''} maxLength={field.max || 8000} onChange={(e) => onChange(e.target.value)} />
        </Shell>
      );
    case 'boolean':
      return (
        <div className="afield afield--check">
          <label className="check">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span>{field.label}</span>
          </label>
          {field.help && <p className="afield__help">{field.help}</p>}
        </div>
      );
    case 'select':
      return (
        <Shell field={field} id={id}>
          <select id={id} className="ainput" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Shell>
      );
    case 'image':
      return (
        <div className="afield">
          <span className="afield__label">{field.label}{field.required && <span className="afield__req"> *</span>}</span>
          <ImageField value={value} onChange={onChange} folder={folder} label={field.label} />
          {field.help && <p className="afield__help">{field.help}</p>}
        </div>
      );
    case 'images': {
      const list = value || [];
      return (
        <div className="afield">
          <span className="afield__label">{field.label}</span>
          <ul className="imglist">
            {list.map((img, i) => (
              <li key={img.publicId || img.url} className="imglist__item">
                <ImageField value={img} onChange={(v) => onChange(v ? list.map((x, j) => (j === i ? v : x)) : list.filter((_, j) => j !== i))} folder={folder} label={`${field.label} ${i + 1}`} />
              </li>
            ))}
          </ul>
          <div className="imglist__add">
            <ImageField value={null} onChange={(v) => v && onChange([...list, v])} folder={folder} label={`add to ${field.label}`} />
          </div>
          {field.help && <p className="afield__help">{field.help}</p>}
        </div>
      );
    }
    case 'stringlist': {
      const list = value || [];
      return (
        <fieldset className="afield afield--set">
          <legend className="afield__label">{field.label}</legend>
          {list.map((item, i) => (
            <div className="rowedit" key={i}>
              <input className="ainput" aria-label={`${field.label} ${i + 1}`} value={item} maxLength={field.max || 300} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="iconbtn" onClick={() => onChange(move(list, i, -1))} disabled={i === 0} aria-label="Move up"><Icon name="up" size={16} /></button>
              <button type="button" className="iconbtn" onClick={() => onChange(move(list, i, 1))} disabled={i === list.length - 1} aria-label="Move down"><Icon name="down" size={16} /></button>
              <button type="button" className="iconbtn iconbtn--danger" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove"><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <button type="button" className="abtn abtn--quiet" onClick={() => onChange([...list, ''])}><Icon name="plus" size={16} /> Add</button>
          {field.help && <p className="afield__help">{field.help}</p>}
        </fieldset>
      );
    }
    case 'group':
      return (
        <fieldset className="afield afield--set">
          <legend className="afield__label">{field.label}</legend>
          <div className="afield__grid">
            {field.fields.map((c) => (
              <Field key={c.key} field={c} value={value?.[c.key]} folder={folder} onChange={(v) => onChange({ ...value, [c.key]: v })} />
            ))}
          </div>
        </fieldset>
      );
    case 'list': {
      const list = value || [];
      const titleKey = field.fields.find((c) => c.type === 'text')?.key;
      return (
        <fieldset className="afield afield--set">
          <legend className="afield__label">{field.label}</legend>
          {list.map((item, i) => (
            <div className="listitem" key={i}>
              <div className="listitem__head">
                <strong>{item?.[titleKey] || `Item ${i + 1}`}</strong>
                <span className="listitem__tools">
                  <button type="button" className="iconbtn" onClick={() => onChange(move(list, i, -1))} disabled={i === 0} aria-label="Move up"><Icon name="up" size={16} /></button>
                  <button type="button" className="iconbtn" onClick={() => onChange(move(list, i, 1))} disabled={i === list.length - 1} aria-label="Move down"><Icon name="down" size={16} /></button>
                  <button type="button" className="iconbtn iconbtn--danger" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove item"><Icon name="trash" size={16} /></button>
                </span>
              </div>
              <div className="afield__grid">
                {field.fields.map((c) => (
                  <Field key={c.key} field={c} value={item?.[c.key]} folder={folder} onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, [c.key]: v } : x)))} />
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="abtn abtn--quiet" onClick={() => onChange([...list, blank({ type: 'group', fields: field.fields })])}>
            <Icon name="plus" size={16} /> Add item
          </button>
          {field.help && <p className="afield__help">{field.help}</p>}
        </fieldset>
      );
    }
    default:
      return null;
  }
}

export function FieldSet({ fields, value, onChange, folder }) {
  return (
    <div className="afield__grid">
      {fields.map((f) => (
        <Field key={f.key} field={f} value={value?.[f.key]} folder={folder} onChange={(v) => onChange({ ...value, [f.key]: v })} />
      ))}
    </div>
  );
}
