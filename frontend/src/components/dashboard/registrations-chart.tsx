'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import type { DashboardStats } from '@/types';
import { AXIS_TICK, CHART_TOOLTIP_STYLE, ChartEmpty, ChartPanel } from './chart-panel';

type Range = 'daily' | 'monthly';

interface Props {
  daily: DashboardStats['dailyRegistrations'];
  monthly: DashboardStats['monthlyRegistrations'];
}

// The server builds both series in UTC, so format them in UTC too. Formatting in
// local time could shift a point to the neighbouring day or month.
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayLong = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const monthLong = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function RegistrationsChart({ daily, monthly }: Props) {
  const [range, setRange] = useState<Range>('daily');

  const points =
    range === 'daily'
      ? daily.map((item) => {
          const date = new Date(`${item.date}T00:00:00Z`);
          return { label: dayLabel.format(date), full: dayLong.format(date), total: item.total };
        })
      : monthly.map((item) => {
          const date = new Date(Date.UTC(item.year, item.month - 1, 1));
          return { label: monthShort.format(date), full: monthLong.format(date), total: item.total };
        });

  const sum = points.reduce((total, point) => total + point.total, 0);

  return (
    <ChartPanel
      title="Patient registrations"
      description={
        range === 'daily' ? 'New patients per day, last 30 days' : 'New patients per month, last 6 months'
      }
      action={
        <div
          role="group"
          aria-label="Chart range"
          className="inline-flex rounded-lg border border-line-strong bg-paper p-0.5"
        >
          {(
            [
              ['daily', '30 days'],
              ['monthly', '6 months'],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => setRange(value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      }
    >
      {sum === 0 ? (
        <ChartEmpty
          title="No registrations in this period"
          description="New patient registrations will appear here."
        />
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="registrationsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f6f63" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0f6f63" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#e1e8e6" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={AXIS_TICK}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ''}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Patients"
                stroke="#0f6f63"
                strokeWidth={2.5}
                fill="url(#registrationsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartPanel>
  );
}
