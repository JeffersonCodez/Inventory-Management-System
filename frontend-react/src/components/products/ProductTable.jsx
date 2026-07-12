import { Eye, Pencil, Trash2, RotateCcw, Package } from 'lucide-react';
import { StatusBadge, CategoryTag } from '../common/Badge.jsx';
import { IconButton } from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { fmtMoney } from '../../utils/format.js';

export default function ProductTable({ products, canDelete, onView, onEdit, onDelete, onRestore }) {
  if (products.length === 0) {
    return (
      <div className="px-4 pb-4">
        <EmptyState icon={Package} message="No products match your filters" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 pt-4">
      <table className="w-full min-w-[820px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="pb-2.5 font-semibold">Product</th>
            <th className="pb-2.5 font-semibold">Category</th>
            <th className="pb-2.5 font-semibold">Supplier</th>
            <th className="pb-2.5 font-semibold">Qty</th>
            <th className="pb-2.5 font-semibold">Min</th>
            <th className="pb-2.5 font-semibold">Purchase</th>
            <th className="pb-2.5 font-semibold">Selling</th>
            <th className="pb-2.5 font-semibold">Status</th>
            <th className="pb-2.5" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={`border-t border-border-soft hover:bg-card-hover ${!p.isActive ? 'opacity-60' : ''}`}>
              <td className="py-3.5">
                <div className="font-semibold">{p.name}</div>
                <div className="font-mono text-[11.5px] text-ink-muted">{p.sku}</div>
              </td>
              <td className="py-3.5">
                <CategoryTag>{p.categoryName}</CategoryTag>
              </td>
              <td className="py-3.5">{p.supplierName}</td>
              <td className="py-3.5 font-mono">
                {p.quantity} {p.unit}
              </td>
              <td className="py-3.5 font-mono">{p.minStock}</td>
              <td className="py-3.5 font-mono">{fmtMoney(p.purchasePrice)}</td>
              <td className="py-3.5 font-mono">{fmtMoney(p.sellingPrice)}</td>
              <td className="py-3.5">
                {/* An archived product's quantity/min-stock derived status
                    (In Stock / Low / Out) no longer means much once it's
                    off the active catalog — Archived overrides it here so
                    the badge always reflects the more important fact. */}
                <StatusBadge status={p.isActive ? p.status : 'archived'} />
              </td>
              <td className="py-3.5">
                <div className="flex justify-end gap-1.5">
                  <IconButton icon={Eye} title="View" onClick={() => onView(p)} />
                  {p.isActive ? (
                    <>
                      <IconButton icon={Pencil} title="Edit" onClick={() => onEdit(p)} />
                      {canDelete && <IconButton icon={Trash2} title="Delete" onClick={() => onDelete(p)} />}
                    </>
                  ) : (
                    canDelete && <IconButton icon={RotateCcw} title="Restore" onClick={() => onRestore(p)} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
