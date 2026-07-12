import { Pencil } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { StatusBadge } from '../common/Badge.jsx';
import { fmtDate, fmtMoney } from '../../utils/format.js';

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11.5px] text-ink-muted">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose, onEdit }) {
  return (
    <Modal
      title={product.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="gold" icon={Pencil} onClick={onEdit}>
            Edit
          </Button>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-ink-secondary">{product.sku}</span>
        <StatusBadge status={product.isActive ? product.status : 'archived'} />
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Category" value={product.categoryName} />
        <Field label="Supplier" value={product.supplierName} />
        <Field label="Quantity" value={`${product.quantity} ${product.unit}`} />
        <Field label="Minimum Stock" value={`${product.minStock} ${product.unit}`} />
        <Field label="Purchase Price" value={fmtMoney(product.purchasePrice)} />
        <Field label="Selling Price" value={fmtMoney(product.sellingPrice)} />
        <Field label="Date Added" value={fmtDate(product.dateAdded)} />
        <Field label="Last Updated" value={fmtDate(product.lastUpdated)} />
      </div>
      <div className="my-5 h-px bg-border-soft" />
      <div className="flex justify-between">
        <span className="text-ink-secondary">Total Stock Value</span>
        <span className="font-mono font-semibold text-gold-light">{fmtMoney(product.quantity * product.purchasePrice)}</span>
      </div>
    </Modal>
  );
}
