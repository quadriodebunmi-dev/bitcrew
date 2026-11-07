import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    api
      .get('/public/bootstrap')
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => setState({ status: 'error', data: null, error }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

// Read one editable section, e.g. useContent('home.hero').
export function useContent(key) {
  const { data } = useSite();
  return data?.content?.[key] || {};
}
