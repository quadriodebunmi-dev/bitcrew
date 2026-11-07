import { useState } from 'react';
import { api, ApiError } from '../api.js';
import { Button } from './Button.jsx';
import Icon from './Icon.jsx';

const TOPICS = [
  { value: 'contact', label: 'General enquiry' },
  { value: 'service', label: 'Service request' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'community', label: 'Community question' },
];

const empty = { name: '', email: '', phone: '', organisation: '', subject: '', skill: '', message: '', company_website: '' };

// Defined at module level so React keeps the same component between renders (inputs keep focus).
function Field({ id, label, error, children, optional }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={`field-${id}`}>{label}{optional && <span className="field__opt"> (optional)</span>}</label>
      {children}
      {error && <p className="field__error" id={`err-${id}`}>{error}</p>}
    </div>
  );
}

/**
 * One form for every public enquiry.
 * - type: fixed submission type, or omit and set `topics` to let the visitor choose.
 * - extras: which optional fields to show.
 */
export default function SubmissionForm({
  type,
  topics = false,
  initialTopic = 'contact',
  initial = {},
  skills = null,
  extras = [],
  messageLabel = 'Message',
  messageRequired = true,
  submitLabel = 'Send message',
  successMessage = 'Thanks. We will be in touch by email.',
}) {
  const [values, setValues] = useState({ ...empty, ...initial });
  const [topic, setTopic] = useState(TOPICS.some((t) => t.value === initialTopic) ? initialTopic : 'contact');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState('');

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const effectiveType = topics ? topic : type;

  function validate() {
    const e = {};
    if (values.name.trim().length < 2) e.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = 'Enter a valid email address.';
    if (messageRequired && values.message.trim().length < 10) e.message = 'Write at least 10 characters.';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    setFailure('');
    try {
      await api.post('/public/submissions', { ...values, type: effectiveType });
      setStatus('sent');
      setValues(empty);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      setFailure(err.message);
      setStatus('failed');
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done" role="status">
        <span className="form-done__icon"><Icon name="check" size={22} strokeWidth={2.4} /></span>
        <p>{successMessage}</p>
        <button className="btn btn--ghost" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    );
  }

  const aria = (id) => ({ id: `field-${id}`, 'aria-invalid': Boolean(errors[id]), 'aria-describedby': errors[id] ? `err-${id}` : undefined });

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {topics && (
        <Field id="topic" label="What is this about?">
          <select {...aria('topic')} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      )}
      <div className="form__row">
        <Field id="name" label="Your name" error={errors.name}>
          <input {...aria('name')} value={values.name} onChange={set('name')} autoComplete="name" required />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input {...aria('email')} type="email" value={values.email} onChange={set('email')} autoComplete="email" required />
        </Field>
      </div>
      {(extras.includes('organisation') || extras.includes('phone')) && (
        <div className="form__row">
          {extras.includes('organisation') && (
            <Field id="organisation" label="Organisation" optional error={errors.organisation}>
              <input {...aria('organisation')} value={values.organisation} onChange={set('organisation')} autoComplete="organization" />
            </Field>
          )}
          {extras.includes('phone') && (
            <Field id="phone" label="Phone" optional error={errors.phone}>
              <input {...aria('phone')} type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" />
            </Field>
          )}
        </div>
      )}
      {skills && (
        <Field id="skill" label="Your main skill area" optional>
          <select {...aria('skill')} value={values.skill} onChange={set('skill')}>
            <option value="">Choose one</option>
            {skills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}
      {extras.includes('subject') && (
        <Field id="subject" label="Subject" optional>
          <input {...aria('subject')} value={values.subject} onChange={set('subject')} />
        </Field>
      )}
      <Field id="message" label={messageLabel} optional={!messageRequired} error={errors.message}>
        <textarea {...aria('message')} rows={5} value={values.message} onChange={set('message')} />
      </Field>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={values.company_website} onChange={set('company_website')} /></label>
      </div>

      {status === 'failed' && <p className="form__alert" role="alert">{failure}</p>}
      <Button type="submit" arrow disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : submitLabel}
      </Button>
    </form>
  );
}
