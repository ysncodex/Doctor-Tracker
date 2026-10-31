'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import type { DashboardStats } from '@/types';
import { CHART_TOOLTIP_STYLE, ChartEmpty, ChartPanel, SERIES_COLORS } from './chart-panel';

const OTHER_COLOR = '#9db0ad';

function colorFor(condition: string, index: number) {
  return condition === 'Other conditions'
    ? OTHER_COLOR
    : SERIES_COLORS[index % SERIES_COLORS.length];
}

export function ConditionsChart({ data }: { data: DashboardStats['conditionBreakdown'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartPanel title="Conditions" description="What patients are being treated for">
      {total === 0 ? (
        <ChartEmpty
          title="No patients yet"
          description="Conditions appear once patients are added."
        />
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center xl:flex-col 2xl:flex-row">
          <div className="relative h-[190px] w-[190px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="condition"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell key={item.condition} fill={colorFor(item.condition, index)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-semibold text-ink tabular">
                {total.toLocaleString('en-US')}
              </span>
              <span className="text-xs text-muted">patients</span>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-2.5">
            {data.map((item, index) => (
              <li key={item.condition} className="flex items-center gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(item.condition, index) }}
                />
                <span className="min-w-0 flex-1 truncate text-ink" title={item.condition}>
                  {item.condition}
                </span>
                <span className="tabular text-muted">
                  {item.count.toLocaleString('en-US')} · {Math.round((item.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartPanel>
  );
}
