import { Layers, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { IconButton } from '../common/Button.jsx';

export default function CategoryCard({ category, canDelete, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-gold/10 text-gold-light">
          <Layers size={19} strokeWidth={1.75} />
        </div>
        <div className="flex gap-1.5">
          <IconButton icon={Pencil} title="Edit" onClick={() => onEdit(category)} />
          {canDelete && <IconButton icon={Trash2} title="Delete" onClick={() => onDelete(category)} />}
        </div>
      </div>
      <div>
        <div className="font-display text-base font-semibold">{category.name}</div>
        <div className="text-xs text-ink-muted">
          {category.productCount} product{category.productCount !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="text-[12.5px] leading-relaxed text-ink-secondary">{category.description || 'No description'}</div>
    </Card>
  );
}
