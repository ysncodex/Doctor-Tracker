'use client';

import { useId, useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterPanelProps {
  search: ReactNode;
  fields: ReactNode;
  dateFilter: ReactNode;
  gridClassName: string;
  activeCount: number;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function FilterPanel({
  search,
  fields,
  dateFilter,
  gridClassName,
  activeCount,
  hasActiveFilters,
  onClear,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const fieldsId = `${uid}-fields`;
  const datesId = `${uid}-dates`;

  return (
    <section aria-label="Filters" className="surface-card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Filter Options {activeCount > 0 && `(${activeCount} active)`}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-pine-700 hover:underline"
          >
            <X size={13} aria-hidden="true" /> Clear all filters
          </button>
        )}
      </div>

      <div className={`grid gap-3 sm:grid-cols-2 ${gridClassName}`}>
        <div className="flex items-end gap-2 sm:block">
          <div className="min-w-0 flex-1">{search}</div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${fieldsId} ${datesId}`}
            onClick={() => setOpen((value) => !value)}
            className="btn-secondary shrink-0 sm:hidden"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pine-700 px-1 text-[11px] font-semibold text-white">
                <span className="sr-only">{activeCount} active: </span>
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div id={fieldsId} className={`${open ? 'grid gap-3' : 'hidden'} sm:contents`}>
          {fields}
        </div>
      </div>

      <div
        id={datesId}
        className={`${open ? 'block' : 'hidden'} mt-3 border-t border-line pt-3 sm:block`}
      >
        {dateFilter}
      </div>
    </section>
  );
}
