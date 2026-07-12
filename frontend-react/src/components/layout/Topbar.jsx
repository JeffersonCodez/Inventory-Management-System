import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { usePageHeaderContext } from '../../context/PageHeaderContext.jsx';

const ROUTE_META = {
  '/': { title: 'Dashboard', eyebrow: 'Overview' },
  '/products': { title: 'Products', eyebrow: 'Inventory' },
  '/categories': { title: 'Categories', eyebrow: 'Inventory' },
  '/suppliers': { title: 'Suppliers', eyebrow: 'Inventory' },
  '/stock-in': { title: 'Stock In', eyebrow: 'Movement' },
  '/stock-out': { title: 'Stock Out', eyebrow: 'Movement' },
  '/transactions': { title: 'Transactions', eyebrow: 'Movement' },
  '/reports': { title: 'Reports', eyebrow: 'Insights' },
  '/users': { title: 'Users', eyebrow: 'Insights' },
  '/settings': { title: 'Settings', eyebrow: 'Insights' },
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { actions } = usePageHeaderContext();
  const meta = ROUTE_META[location.pathname] || { title: '', eyebrow: '' };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border text-ink md:hidden"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
        <div>
          <div className="mb-0.5 text-[11.5px] font-bold uppercase tracking-widest text-gold-dim">{meta.eyebrow}</div>
          <h2 className="font-display text-[26px] font-semibold">{meta.title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-2.5">{actions}</div>
    </div>
  );
}
