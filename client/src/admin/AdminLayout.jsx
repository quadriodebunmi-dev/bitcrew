import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { useAdminData } from './useApi.js';
import Icon from '../components/Icon.jsx';
import { BitMark } from '../components/Logo.jsx';
import { Splash } from '../components/Splash.jsx';

const COLLECTIONS = [
  ['services', 'layers'],
  ['programs', 'calendar'],
  ['projects', 'folder'],
  ['gallery', 'camera'],
  ['videos', 'play'],
  ['team', 'users'],
  ['partners', 'handshake'],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const schema = useAdminData('/admin/schema');
  const stats = useAdminData('/admin/stats', [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  if (schema.loading && !schema.data) return <Splash label="Loading dashboard" />;
  if (schema.error) {
    return (
      <div className="splash splash--error" role="alert">
        <h1>Dashboard could not load</h1>
        <p>{schema.error.message}</p>
        <button className="btn btn--primary" onClick={schema.reload}>Try again</button>
      </div>
    );
  }

  const unread = stats.data?.submissions?.unread || 0;
  const entities = schema.data.entities;

  return (
    <div className="admin">
      <header className="admin__top">
        <button className="iconbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="admin-nav">
          <Icon name={open ? 'close' : 'menu'} size={22} /><span className="sr-only">Menu</span>
        </button>
        <BitMark size={26} /> <strong>Dashboard</strong>
      </header>

      <aside id="admin-nav" className={`admin__side ${open ? 'is-open' : ''}`}>
        <div className="admin__brand"><BitMark size={30} /><span>BitCrew admin</span></div>
        <nav aria-label="Dashboard">
          <NavLink to="/admin" end><Icon name="home" /> Overview</NavLink>
          <NavLink to="/admin/inbox"><Icon name="inbox" /> Inbox {unread > 0 && <span className="pill" aria-label={`${unread} unread`}>{unread}</span>}</NavLink>
          <p className="admin__group">Website</p>
          <NavLink to="/admin/content"><Icon name="file" /> Page content</NavLink>
          {COLLECTIONS.map(([kind, icon]) => (
            <NavLink key={kind} to={`/admin/collection/${kind}`}><Icon name={icon} /> {entities[kind]?.label || kind}</NavLink>
          ))}
          <p className="admin__group">Account</p>
          <NavLink to="/admin/account"><Icon name="settings" /> Password</NavLink>
        </nav>
        <div className="admin__foot">
          <a href="/" target="_blank" rel="noopener noreferrer"><Icon name="external" /> View website</a>
          <button onClick={logout}><Icon name="logout" /> Sign out</button>
          <small>{user?.email}</small>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet context={{ schema: schema.data, stats: stats.data }} />
      </main>
    </div>
  );
}
