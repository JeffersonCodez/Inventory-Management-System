import { History } from 'lucide-react';
import { TypeBadge } from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { fmtDate } from '../../utils/format.js';

export default function TransactionsTable({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="px-4 pb-4">
        <EmptyState icon={History} message="No transactions match your filters" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 pt-4">
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="pb-2.5 font-semibold">Product</th>
            <th className="pb-2.5 font-semibold">Type</th>
            <th className="pb-2.5 font-semibold">Qty</th>
            <th className="pb-2.5 font-semibold">Date</th>
            <th className="pb-2.5 font-semibold">User</th>
            <th className="pb-2.5 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t border-border-soft hover:bg-card-hover">
              <td className="py-3.5 font-semibold">{t.productName}</td>
              <td className="py-3.5">
                <TypeBadge type={t.type} />
              </td>
              <td className={`py-3.5 font-mono ${t.type === 'in' ? 'text-success' : 'text-danger'}`}>
                {t.type === 'in' ? '+' : '-'}
                {t.quantity}
              </td>
              <td className="py-3.5">{fmtDate(t.date)}</td>
              <td className="py-3.5">{t.user}</td>
              <td className="py-3.5 text-ink-muted">
                {t.type === 'in'
                  ? `${t.notes || 'Received'}`
                  : `${t.reason || ''}${t.destination ? ' → ' + t.destination : ''}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
