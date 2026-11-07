import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { BitMark } from '../components/Logo.jsx';
import { Button } from '../components/Button.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <BitMark size={40} />
        <h1>Sign in to the dashboard</h1>
        <div className="afield">
          <label className="afield__label" htmlFor="login-email">Email</label>
          <input id="login-email" className="ainput" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="afield">
          <label className="afield__label" htmlFor="login-password">Password</label>
          <input id="login-password" className="ainput" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="form__alert" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <Link to="/" className="login__back">Back to the website</Link>
      </form>
    </main>
  );
}
