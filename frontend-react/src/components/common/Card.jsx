import { forwardRef } from 'react';

// forwardRef matters here — Card is used in several places as a plain
// presentational wrapper, but the auto-fill table pages (Products,
// Transactions, Profit) need a real DOM ref on it to measure available
// height. Without forwardRef, `ref={...}` on a function component is
// silently dropped (or logs a console warning) — it does NOT attach to
// the underlying <div>, which would make useAutoPageSize measure nothing
// and quietly fall back to its default page size, no error at all.
export const Card = forwardRef(function Card({ children, className = '', noPadding = false }, ref) {
  return (
    <div ref={ref} className={`card ${noPadding ? '!p-0' : ''} ${className}`}>
      {children}
    </div>
  );
});

export function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <div>
        <h3 className="font-display text-[16.5px] font-semibold">{title}</h3>
        {subtitle && <div className="text-[11.5px] text-ink-muted">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
