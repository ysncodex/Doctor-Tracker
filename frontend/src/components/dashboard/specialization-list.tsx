import type { DashboardStats } from '@/types';
import { ChartEmpty, ChartPanel } from './chart-panel';

/** Simple proportional bars. Plain HTML, so it is fully readable by screen readers. */
export function SpecializationList({ data }: { data: DashboardStats['specializationBreakdown'] }) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <ChartPanel title="Doctors by specialization" description="How the medical team is made up">
      {data.length === 0 ? (
        <ChartEmpty title="No doctors yet" description="Add doctors to see their specializations." />
      ) : (
        <ul className="space-y-4">
          {data.map((item) => (
            <li key={item.specialization}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink" title={item.specialization}>
                  {item.specialization}
                </span>
                <span className="tabular text-muted">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-pine-50" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-pine-600"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartPanel>
  );
}
