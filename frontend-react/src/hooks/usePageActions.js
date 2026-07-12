import { useEffect } from 'react';
import { usePageHeaderContext } from '../context/PageHeaderContext.jsx';

// Call from any page: usePageActions(<Button variant="gold">Add Product</Button>)
// Renders that node in the shared topbar and clears it when the page unmounts.
export function usePageActions(node, deps = []) {
  const { setActions } = usePageHeaderContext();

  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
