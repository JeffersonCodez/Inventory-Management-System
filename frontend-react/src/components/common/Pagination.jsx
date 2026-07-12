import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
      if (i === 2 || i === totalPages - 1) pages.push('…');
      continue;
    }
    pages.push(i);
  }

  return (
    <div className="mt-auto flex items-center justify-between px-[18px] pb-[18px] pt-0 text-[12.5px] text-ink-secondary">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border-soft text-ink-secondary disabled:opacity-35"
        >
          <ChevronLeft size={15} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-ink-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border text-[12.5px] ${
                p === page ? 'border-gold-dim bg-gold/10 text-gold-light' : 'border-border-soft text-ink-secondary'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border-soft text-ink-secondary disabled:opacity-35"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
