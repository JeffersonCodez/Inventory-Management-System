import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer, maxWidth = 'max-w-[520px]' }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} max-h-[88vh] overflow-y-auto rounded-card border border-border bg-card shadow-card animate-modalIn`}>
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-ink-muted hover:bg-card-hover hover:text-ink"
          >
            <X size={17} strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2.5 border-t border-border-soft px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
