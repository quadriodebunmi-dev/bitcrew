import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './auth.jsx';
import { useToast } from './toast.jsx';
import { Button } from '../components/Button.jsx';

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 10) return setError('Use at least 10 characters for the new password.');
    if (form.newPassword !== form.confirm) return setError('The new passwords do not match.');
    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.ok('Password changed.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Password</h1>
      <form className="panel panel--narrow" onSubmit={submit}>
        <p className="muted">Signed in as {user?.email}</p>
        <div className="afield"><label className="afield__label" htmlFor="cp">Current password</label><input id="cp" className="ainput" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} required /></div>
        <div className="afield"><label className="afield__label" htmlFor="np">New password</label><input id="np" className="ainput" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} required /><p className="afield__help">At least 10 characters.</p></div>
        <div className="afield"><label className="afield__label" htmlFor="cf">Confirm new password</label><input id="cf" className="ainput" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required /></div>
        {error && <p className="form__alert" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</Button>
      </form>
    </div>
  );
}
