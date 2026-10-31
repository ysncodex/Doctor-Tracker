'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import type { DashboardStats } from '@/types';
import { AXIS_TICK, CHART_TOOLTIP_STYLE, ChartEmpty, ChartPanel } from './chart-panel';

const MAX_DOCTORS = 8;

export function DoctorChart({ data }: { data: DashboardStats['patientsPerDoctor'] }) {
  const formatted = data.slice(0, MAX_DOCTORS).map((item) => ({
    fullName: item.doctorName,
    name: item.doctorName.length > 18 ? `${item.doctorName.slice(0, 17)}…` : item.doctorName,
    patients: item.patientCount,
  }));

  return (
    <ChartPanel title="Patients per doctor" description="Doctors with the largest caseloads">
      {formatted.length === 0 ? (
        <ChartEmpty
          title="No patient assignments yet"
          description="Assign patients to doctors to see the distribution."
        />
      ) : (
        <div style={{ height: Math.max(200, formatted.length * 38 + 20) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatted}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#e1e8e6" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={AXIS_TICK}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#10272b' }}
              />
              <Tooltip
                cursor={{ fill: '#eaf4f1' }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#0f6f63"
                radius={[0, 6, 6, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartPanel>
  );
}
