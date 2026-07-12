import { NavLink } from 'react-router-dom';
import {
  Home, Package, Layers, Truck, ArrowDownToLine, ArrowUpFromLine,
  History, BarChart3, TrendingUp, Users, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { section: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: Home, end: true }] },
  {
    section: 'Inventory',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Layers },
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    section: 'Movement',
    items: [
      { to: '/stock-in', label: 'Stock In', icon: ArrowDownToLine },
      { to: '/stock-out', label: 'Stock Out', icon: ArrowUpFromLine },
      { to: '/transactions', label: 'Transactions', icon: History },
    ],
  },
  {
    section: 'Insights',
    items: [
      { to: '/profit', label: 'Profit', icon: TrendingUp },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/users', label: 'Users', icon: Users, adminOnly: true },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ open, onNavigate }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 z-[90] flex h-screen w-[230px] flex-col border-r border-border-soft
                  bg-bg-elevated p-3.5 transition-transform duration-200 ease-out
                  md:sticky md:translate-x-0
                  ${open ? 'translate-x-0 shadow-card' : '-translate-x-full'}`}
    >
      <div className="mb-7 flex items-center gap-2.5 px-2.5">
        <div className="h-3.5 w-3.5 rotate-45 bg-gold" />
        <span className="font-display text-[22px] font-semibold tracking-wide">LEDGER</span>
      </div>

      {NAV.map((group) => (
        <div key={group.section}>
          <div className="mb-2 mt-4 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-ink-muted first:mt-0">
            {group.section}
          </div>
          {group.items
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `relative mb-0.5 flex items-center gap-2.5 rounded-control px-3 py-2.5 text-[13.5px] font-medium
                   transition-colors ${
                     isActive
                       ? 'bg-gold/10 text-gold-light before:absolute before:-left-3.5 before:top-1/2 before:h-[18px] before:w-[3px] before:-translate-y-1/2 before:rounded-r-[3px] before:bg-gold'
                       : 'text-ink-secondary hover:bg-card-hover hover:text-ink'
                   }`
                }
              >
                <item.icon size={18} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </div>
      ))}

      <div className="mt-auto border-t border-border-soft pt-3.5">
        <div className="flex items-center gap-2.5 rounded-control px-2.5 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-dim font-display text-[13px] font-bold text-[#141208]">
            {user?.name?.[0] || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{user?.name}</div>
            <div className="text-[11px] capitalize text-ink-muted">{user?.role}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted hover:bg-card-hover hover:text-ink"
          >
            <LogOut size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
