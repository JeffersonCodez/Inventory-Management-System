import { ChevronUp, ChevronDown, TrendingUp } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { fmtMoney, fmtDate } from '../../utils/format.js';

// Only columns the backend actually knows how to ORDER BY (see
// SORTABLE_COLUMNS in models/Sale.js) get a clickable header — Transaction
// ID / Purchase Price / Selling Price / Sold By aren't in that whitelist,
// so they render as plain, non-interactive headers instead of pretending
// to be sortable.
const SORTABLE = {
  date: 'Date Sold',
  product: 'Product',
  quantity: 'Qty Sold',
  profit: 'Profit Earned',
};

function SortableHeader({ column, label, sortBy, sortDir, onSort }) {
  const active = sortBy === column;
  return (
    <th className="pb-2.5 font-semibold">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`flex items-center gap-1 ${active ? 'text-gold-light' : ''}`}
      >
        {label}
        {active && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>
    </th>
  );
}

export default function ProfitTable({ sales, sortBy, sortDir, onSort }) {
  if (sales.length === 0) {
    return (
      <div className="px-4 pb-4">
        <EmptyState icon={TrendingUp} message="No sales recorded for this range yet" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 pt-4">
      <table className="w-full min-w-[860px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="pb-2.5 font-semibold">Txn ID</th>
            <SortableHeader column="product" label={SORTABLE.product} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortableHeader column="quantity" label={SORTABLE.quantity} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <th className="pb-2.5 font-semibold">Purchase Price</th>
            <th className="pb-2.5 font-semibold">Selling Price</th>
            <SortableHeader column="profit" label={SORTABLE.profit} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortableHeader column="date" label={SORTABLE.date} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <th className="pb-2.5 font-semibold">Sold By</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-t border-border-soft hover:bg-card-hover">
              <td className="py-3.5 font-mono text-ink-muted">#{s.transactionId}</td>
              <td className="py-3.5">
                <div className="font-semibold">{s.productName}</div>
                <div className="font-mono text-[11.5px] text-ink-muted">{s.productSku}</div>
              </td>
              <td className="py-3.5 font-mono">{s.quantitySold}</td>
              <td className="py-3.5 font-mono text-ink-muted">{fmtMoney(s.purchasePrice)}</td>
              <td className="py-3.5 font-mono text-ink-muted">{fmtMoney(s.sellingPrice)}</td>
              <td className={`py-3.5 font-mono font-semibold ${s.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {fmtMoney(s.totalProfit)}
              </td>
              <td className="py-3.5">{fmtDate(String(s.soldAt).slice(0, 10))}</td>
              <td className="py-3.5">{s.soldBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
