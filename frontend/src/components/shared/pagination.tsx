import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const buttonClass = 'btn-secondary h-9 px-3';

export function Pagination({ page, pageSize, total, totalPages, onPageChange }: PaginationProps) {
  const pages = Math.max(1, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4"
    >
      <p className="text-sm text-muted tabular" aria-live="polite">
        Showing {from}–{to} of {total.toLocaleString('en-US')}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={buttonClass}
        >
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </button>

        <span className="px-1 text-sm text-ink tabular" aria-current="page">
          {page} / {pages}
        </span>

        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className={buttonClass}
        >
          Next <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
