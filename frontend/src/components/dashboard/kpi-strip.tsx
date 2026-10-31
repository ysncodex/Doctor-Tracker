import type { DashboardStats } from '@/types';

type Overview = DashboardStats['overview'];

interface Kpi {
  label: string;
  value: string;
  note: string;
}

function buildKpis(overview: Overview): Kpi[] {
  const n = (value: number) => value.toLocaleString('en-US');

  return [
    {
      label: 'Doctors',
      value: n(overview.totalDoctors),
      note:
        overview.newDoctorsThisMonth > 0
          ? `${n(overview.newDoctorsThisMonth)} joined this month`
          : 'No new doctors this month',
    },
    {
      label: 'Patients',
      value: n(overview.totalPatients),
      note: 'Across all doctors',
    },
    {
      label: 'Patients per doctor',
      value: overview.averagePatientsPerDoctor.toLocaleString('en-US', {
        maximumFractionDigits: 1,
      }),
      note: 'Average caseload',
    },
    {
      label: 'New this month',
      value: n(overview.newPatientsThisMonth),
      note: `${n(overview.previousMonthPatients)} registered last month`,
    },
  ];
}

export function KpiStrip({ overview }: { overview: Overview }) {
  return (
    <section
      aria-label="Overview"
      className="surface-card grid grid-cols-2 overflow-hidden lg:grid-cols-4"
    >
      {buildKpis(overview).map((kpi, index) => (
        <div
          key={kpi.label}
          className={`p-5 sm:p-6 ${index % 2 === 1 ? 'border-l border-line' : ''} ${
            index >= 2 ? 'border-t border-line lg:border-t-0' : ''
          } ${index > 0 ? 'lg:border-l lg:border-line' : ''}`}
        >
          <p className="text-sm font-medium text-muted">{kpi.label}</p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink tabular sm:text-5xl">
            {kpi.value}
          </p>
          <p className="mt-2 text-xs text-muted">{kpi.note}</p>
        </div>
      ))}
    </section>
  );
}
