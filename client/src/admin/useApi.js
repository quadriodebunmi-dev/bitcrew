import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './auth.jsx';

// Load data from the admin API. A 401 signs the person out; anything else is shown inline.
export function useAdminData(path, deps = []) {
  const { expire } = useAuth();
  const [state, setState] = useState({ data: null, error: null, loading: true });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get(path);
      setState({ data, error: null, loading: false });
    } catch (error) {
      if (error.status === 401) expire();
      setState({ data: null, error, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, expire, ...deps]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data })) };
}

// Wrap a mutation so 401s sign out and other errors become toasts.
export function useGuard(toast) {
  const { expire } = useAuth();
  return useCallback(async (fn, successMessage) => {
    try {
      const r = await fn();
      if (successMessage) toast.ok(successMessage);
      return r;
    } catch (err) {
      if (err.status === 401) expire();
      else toast.error(err.message);
      return undefined;
    }
  }, [expire, toast]);
}
