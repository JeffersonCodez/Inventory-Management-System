const STATUS_MAP = {
  ok: { label: 'In Stock', className: 'bg-success-bg text-success' },
  low: { label: 'Low Stock', className: 'bg-warning-bg text-warning' },
  out: { label: 'Out of Stock', className: 'bg-danger-bg text-danger' },
  archived: { label: 'Archived', className: 'bg-ink-muted/10 text-ink-muted' },
};

export function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || STATUS_MAP.ok;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isIn = type === 'in';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isIn ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isIn ? 'Stock In' : 'Stock Out'}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-gold-light">
      {role}
    </span>
  );
}

export function CategoryTag({ children }) {
  return (
    <span className="inline-block rounded-full border border-border-soft bg-bg-elevated px-2.5 py-0.5 text-[11.5px] text-ink-secondary">
      {children}
    </span>
  );
}
