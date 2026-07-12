import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';

export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-[380px] rounded-card border border-border bg-card p-7 text-center shadow-card animate-modalIn">
        <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-danger-bg text-danger">
          <AlertTriangle size={24} strokeWidth={1.75} />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
        <p className="mb-5 text-[13px] leading-relaxed text-ink-secondary">{message}</p>
        <div className="flex gap-2.5">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn flex-1 border-danger bg-danger text-white hover:brightness-110"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
