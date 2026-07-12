import { createContext, useContext, useState, useCallback } from 'react';

const PageHeaderContext = createContext(null);

export function PageHeaderProvider({ children }) {
  const [actions, setActionsState] = useState(null);

  // Pages call this (via usePageActions) to render buttons in the topbar,
  // e.g. Products page renders an "Add Product" button there.
  const setActions = useCallback((node) => setActionsState(node), []);

  return <PageHeaderContext.Provider value={{ actions, setActions }}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeaderContext must be used within PageHeaderProvider');
  return ctx;
}
