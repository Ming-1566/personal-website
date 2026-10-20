import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import { storageKeys } from '../api/storage';
import { PortfolioContext } from './context';
import type { PortfolioState } from './context';

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<PortfolioState, 'refresh'>>({ content: null, managedContent: null,
    session: null, ready: false, error: '' });
  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    try {
      const [content, session] = await Promise.all([api.content.get(), api.auth.getSession()]);
      const managedContent = session ? { ...content, skills: await api.skills.list('all'),
        projects: await api.projects.list('all'), posts: await api.posts.list('all') } : null;
      if (request === requestId.current) setState({ content, managedContent, session, ready: true, error: '' });
    } catch (error) {
      if (request === requestId.current) setState((previous) => ({ ...previous, session: null, managedContent: null,
        ready: true, error: error instanceof Error ? error.message : '暂时无法读取内容。' }));
    }
  }, []);
  useEffect(() => {
    void refresh();
    const unsubscribe = api.subscribe(() => { void refresh(); });
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || Object.values(storageKeys).includes(event.key)) api.notifyExternalChange();
    };
    window.addEventListener('storage', onStorage);
    return () => { requestId.current += 1; unsubscribe(); window.removeEventListener('storage', onStorage); };
  }, [refresh]);
  useEffect(() => {
    if (!state.session) return;
    const timeout = window.setTimeout(() => { void refresh(); }, Math.max(0, state.session.expiresAt - Date.now()) + 20);
    return () => window.clearTimeout(timeout);
  }, [state.session, refresh]);
  return <PortfolioContext.Provider value={{ ...state, refresh }}>{children}</PortfolioContext.Provider>;
}

