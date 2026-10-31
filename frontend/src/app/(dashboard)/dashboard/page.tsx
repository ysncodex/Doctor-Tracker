'use client';

import Link from 'next/link';
import { ArrowUpRight, RefreshCw, Stethoscope, Users } from 'lucide-react';

import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { formatDate } from '@/lib/format';
import { getDoctorId, getDoctorName } from '@/lib/patients';
import type { DashboardStats, Patient } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { KpiStrip } from '@/components/dashboard/kpi-strip';
import { RegistrationsChart } from '@/components/dashboard/registrations-chart';
import { ConditionsChart } from '@/components/dashboard/conditions-chart';
import { DoctorChart } from '@/components/dashboard/doctor-chart';
import { SpecializationList } from '@/components/dashboard/specialization-list';

type RecentPatient = DashboardStats['recentPatients'][number];

export default function DashboardPage() {
  const { data, isLoading, isFetching, refetch } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;

  // Preserve cached data during background refetch failures.
  if (!data) return <DashboardError onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A live view of your doctors, patients and registrations."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh dashboard"
              title="Refresh"
              className="btn-secondary w-10 px-0"
            >
              <RefreshCw
                size={16}
                className={isFetching ? 'animate-spin' : undefined}
                aria-hidden="true"
              />
            </button>

            <Link href="/doctors" className="btn-secondary">
              <Stethoscope size={16} aria-hidden="true" />
              Doctors
            </Link>

            <Link href="/patients" className="btn-primary">
              <Users size={16} aria-hidden="true" />
              Patients
            </Link>
          </div>
        }
      />

      <div className="space-y-5">
        <KpiStrip overview={data.overview} />

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RegistrationsChart
              daily={data.dailyRegistrations}
              monthly={data.monthlyRegistrations}
            />
          </div>

          <ConditionsChart data={data.conditionBreakdown} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <DoctorChart data={data.patientsPerDoctor} />
          <SpecializationList data={data.specializationBreakdown} />
        </div>

        <RecentPatients patients={data.recentPatients} />
      </div>
    </div>
  );
}

function RecentPatients({ patients }: { patients: RecentPatient[] }) {
  return (
    <section aria-labelledby="recent-patients-title" className="surface-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line p-5 sm:px-6">
        <div>
          <h2 id="recent-patients-title" className="font-display text-lg font-semibold text-ink">
            Recently registered
          </h2>

          <p className="mt-0.5 text-sm text-muted">The five newest patient records</p>
        </div>

        <Link
          href="/patients"
          className="flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-pine-700 hover:text-pine-900"
        >
          View all
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="p-10 text-center">
          <Users className="mx-auto text-pine-300" size={30} aria-hidden="true" />

          <p className="mt-3 text-sm font-medium text-ink">No patients yet</p>

          <p className="mt-1 text-xs text-muted">
            Patients you add will appear here as they register.
          </p>

          <Link href="/patients" className="btn-secondary mt-5">
            Go to patients
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile and tablet: patient cards, matching the Patients page. */}
          <div className="md:grid-cols-2 xl:hidden">
            <ul className="grid gap-3 p-4 md:grid-cols-2">
              {patients.map((patient) => (
                <RecentPatientCard key={patient._id} patient={patient} />
              ))}
            </ul>
          </div>

          {/* Desktop: preserve the existing table layout. */}
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Most recently registered patients</caption>

              <thead className="bg-paper text-xs text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Patient
                  </th>

                  <th scope="col" className="px-5 py-3 font-medium">
                    Condition
                  </th>

                  <th scope="col" className="px-5 py-3 font-medium">
                    Doctor
                  </th>

                  <th scope="col" className="px-6 py-3 font-medium">
                    Registered
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {patients.map((patient) => (
                  <tr key={patient._id} className="transition-colors hover:bg-pine-50/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-medium text-ink">{patient.name}</p>

                      <p className="mt-0.5 text-xs text-muted">
                        {patient.age} years · {patient.gender}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Badge tone="auto">{patient.condition}</Badge>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <DoctorCell doctorId={patient.doctorId} />
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-muted">
                      <time dateTime={new Date(patient.createdAt).toISOString()}>
                        {formatDate(patient.createdAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

/** Mobile/tablet layout for recently registered patients. */
function RecentPatientCard({ patient }: { patient: RecentPatient }) {
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">{patient.name}</p>

          <p className="mt-0.5 text-xs text-muted">
            {patient.age} years · {patient.gender}
          </p>
        </div>

        <Badge tone="auto">{patient.condition}</Badge>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">Doctor</dt>

          <dd className="min-w-0">
            <DoctorCell doctorId={patient.doctorId} />
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
        <span className="text-xs text-muted">Registered {formatDate(patient.createdAt)}</span>
      </div>
    </li>
  );
}

/** Reuses the same doctor navigation behavior as the Patients page. */
function DoctorCell({ doctorId }: { doctorId: Patient['doctorId'] }) {
  const name = getDoctorName(doctorId);
  const id = getDoctorId(doctorId);

  if (!name || !id) {
    return <span className="text-muted">—</span>;
  }

  return (
    <Link href={`/doctors/${id}`} className="text-ink/80 hover:text-pine-700 hover:underline">
      {name}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>

      <div className="mb-8 space-y-2">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-line" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-line" />
      </div>

      <div className="surface-card h-36 animate-pulse bg-white/60" />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="surface-card h-80 animate-pulse bg-white/60 xl:col-span-2" />
        <div className="surface-card h-80 animate-pulse bg-white/60" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="surface-card h-72 animate-pulse bg-white/60" />
        <div className="surface-card h-72 animate-pulse bg-white/60" />
      </div>
    </div>
  );
}

function DashboardError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div role="alert" className="surface-card mx-auto max-w-lg p-8 text-center">
      <p className="font-display text-lg font-semibold text-ink">We couldn’t load the dashboard</p>

      <p className="mt-2 text-sm text-muted">
        The server didn’t respond. Check your connection or that the backend is running, then try
        again.
      </p>

      <button type="button" onClick={onRetry} disabled={isRetrying} className="btn-primary mt-5">
        {isRetrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  );
}
