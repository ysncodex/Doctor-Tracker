import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-paper" />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  children?: ReactNode;
}

export function ErrorState({ title, description, onRetry, isRetrying, children }: ErrorStateProps) {
  return (
    <div role="alert" className="p-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button type="button" onClick={onRetry} disabled={isRetrying} className="btn-primary">
            {isRetrying ? 'Retrying…' : 'Try again'}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pine-50 text-pine-600">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
