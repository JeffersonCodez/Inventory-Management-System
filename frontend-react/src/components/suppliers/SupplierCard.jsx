import { Truck, Pencil, Trash2, User, Phone, Mail, MapPin } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { IconButton } from '../common/Button.jsx';

function Row({ icon: Icon, children }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 last:mb-0">
      <Icon size={14} strokeWidth={1.75} className="flex-shrink-0 text-ink-muted" />
      <span className="truncate">{children || '—'}</span>
    </div>
  );
}

export default function SupplierCard({ supplier, canDelete, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-gold/10 text-gold-light">
          <Truck size={19} strokeWidth={1.75} />
        </div>
        <div className="flex gap-1.5">
          <IconButton icon={Pencil} title="Edit" onClick={() => onEdit(supplier)} />
          {canDelete && <IconButton icon={Trash2} title="Delete" onClick={() => onDelete(supplier)} />}
        </div>
      </div>
      <div>
        <div className="font-display text-base font-semibold">{supplier.name}</div>
        <div className="text-xs text-ink-muted">
          {supplier.productCount} product{supplier.productCount !== 1 ? 's' : ''} supplied
        </div>
      </div>
      <div className="text-[12.5px] text-ink-secondary">
        <Row icon={User}>{supplier.contact}</Row>
        <Row icon={Phone}>{supplier.phone}</Row>
        <Row icon={Mail}>{supplier.email}</Row>
        <Row icon={MapPin}>{supplier.address}</Row>
      </div>
    </Card>
  );
}
