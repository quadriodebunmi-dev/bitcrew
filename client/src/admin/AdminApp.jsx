import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import { ToastProvider } from './toast.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ContentEditor from './ContentEditor.jsx';
import EntityManager from './EntityManager.jsx';
import Inbox from './Inbox.jsx';
import Account from './Account.jsx';
import { Splash } from '../components/Splash.jsx';
import '../styles/admin.css';

function AdminRoutes() {
  const { user, checking } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard | BitCrew Network';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.body.classList.add('is-admin');
    return () => { meta.remove(); document.body.classList.remove('is-admin'); };
  }, []);

  if (checking) return <Splash label="Checking your session" />;
  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="content" element={<ContentEditor />} />
        <Route path="content/:key" element={<ContentEditor />} />
        <Route path="collection/:kind" element={<EntityManager />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
