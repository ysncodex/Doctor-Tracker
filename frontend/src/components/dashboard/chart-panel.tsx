import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  description,
  action,
  children,
  className = '',
}: ChartPanelProps) {
  return (
    <section className={`surface-card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ChartEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-xl bg-paper px-6 text-center">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #e1e8e6',
  boxShadow: '0 8px 24px rgb(16 39 43 / 0.08)',
  fontSize: 12,
} as const;

export const AXIS_TICK = { fontSize: 12, fill: '#566a6d' } as const;

export const SERIES_COLORS = [
  '#0f6f63',
  '#d19a1a',
  '#5b6ee1',
  '#c2415a',
  '#2f9bc4',
  '#8a63c9',
] as const;
