'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/shared/data-states';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PatientFormModal } from '@/components/patients/patient-form-modal';
import { useDoctor, useDoctorPatients } from '@/hooks/use-doctor-details';
import { useClampPage } from '@/hooks/use-list-filters';
import { usePatientMutations } from '@/hooks/use-patients';
import { getApiErrorMessage } from '@/lib/api-error';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate, getInitial, pluralize } from '@/lib/format';
import type { Patient } from '@/types';

export default function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const doctorQuery = useDoctor(id);
  const patientsQuery = useDoctorPatients(id, page);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const { remove } = usePatientMutations();

  // If the last patient on a page is deleted, step back instead of showing an empty page.
  useClampPage(page, patientsQuery.data?.pagination.totalPages, setPage);

  if (doctorQuery.isLoading) return <DoctorDetailsSkeleton />;

  if (!doctorQuery.data) {
    return (
      <div className="surface-card mx-auto max-w-lg">
        <ErrorState
          title="Doctor not found"
          description="This doctor may have been deleted, or the server couldn’t be reached."
          onRetry={() => doctorQuery.refetch()}
          isRetrying={doctorQuery.isFetching}
        >
          <Link href="/doctors" className="btn-secondary">
            Back to doctors
          </Link>
        </ErrorState>
      </div>
    );
  }

  const doctor = doctorQuery.data;
  const patients = patientsQuery.data?.data ?? [];
  const pagination = patientsQuery.data?.pagination;
  const totalPatients = pagination?.total ?? patients.length;
  const isRefreshing = patientsQuery.isFetching && !patientsQuery.isLoading;

  function openDelete(patient: Patient) {
    remove.reset();
    setDeleteTarget(patient);
  }

  function closeDelete() {
    if (remove.isPending) return;
    remove.reset();
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div>
      <Link
        href="/doctors"
        className="mb-5 inline-flex items-center gap-2 rounded-md text-sm text-muted hover:text-pine-700"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to doctors
      </Link>

      <PageHeader
        title="Doctor profile"
        description="View professional information and manage this doctor’s patients."
        action={
          <button type="button" onClick={() => setIsPatientModalOpen(true)} className="btn-primary">
            <Plus size={16} aria-hidden="true" /> Add patient
          </button>
        }
      />

      <section aria-label="Doctor information" className="surface-card mb-6 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-pine-900 font-display text-4xl font-semibold text-white"
          >
            {getInitial(doctor.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold text-ink">{doctor.name}</h2>
            <div className="mt-2">
              <Badge>{doctor.specialization}</Badge>
            </div>
            <p className="mt-3 text-xs text-muted">Registered {formatDate(doctor.createdAt)}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
          <InfoItem icon={Building2} label="Hospital">
            {doctor.hospital}
          </InfoItem>

          <InfoItem icon={Mail} label="Email">
            <a href={`mailto:${doctor.email}`} className="hover:text-pine-700 hover:underline">
              {doctor.email}
            </a>
          </InfoItem>

          <InfoItem icon={Phone} label="Phone">
            <a href={`tel:${doctor.phone}`} className="hover:text-pine-700 hover:underline">
              {doctor.phone}
            </a>
          </InfoItem>
        </div>
      </section>

      <section aria-labelledby="associated-patients-title" className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2
              id="associated-patients-title"
              className="font-display text-lg font-semibold text-ink"
            >
              Associated patients
            </h2>
            <p className="mt-0.5 text-sm text-muted" aria-live="polite">
              {pluralize(totalPatients, 'patient')} assigned
            </p>
          </div>
        </div>

        {patientsQuery.isLoading ? (
          <TableSkeleton rows={3} />
        ) : patientsQuery.isError && !patientsQuery.data ? (
          <ErrorState
            title="We couldn’t load this doctor’s patients"
            onRetry={() => patientsQuery.refetch()}
            isRetrying={patientsQuery.isFetching}
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="No patients assigned yet"
            description="Add the first patient directly to this doctor’s patient list."
          >
            <button
              type="button"
              onClick={() => setIsPatientModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={16} aria-hidden="true" /> Add first patient
            </button>
          </EmptyState>
        ) : (
          <>
            <div
              aria-busy={isRefreshing}
              className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}
            >
              {/* Phones: one card per patient. */}
              <ul className="space-y-3 p-4 md:hidden">
                {patients.map((patient) => (
                  <li key={patient._id} className="rounded-xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{patient.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{patient.age} years</p>
                      </div>
                      <Badge tone="auto">{patient.condition}</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                      <span className="text-sm text-ink/80">{patient.phone}</span>
                      <button
                        type="button"
                        onClick={() => openDelete(patient)}
                        aria-label={`Remove ${patient.name} from ${doctor.name}'s patient list`}
                        title="Delete patient"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablets and up: the table. */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <caption className="sr-only">Patients assigned to {doctor.name}</caption>
                  <thead className="bg-paper text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Patient
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Age
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Condition
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {patients.map((patient) => (
                      <tr key={patient._id} className="transition-colors hover:bg-pine-50/50">
                        <td className="px-6 py-4 font-medium text-ink">{patient.name}</td>
                        <td className="px-5 py-4 text-ink/80">{patient.age}</td>
                        <td className="px-5 py-4">
                          <Badge tone="auto">{patient.condition}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-ink/80">{patient.phone}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDelete(patient)}
                            aria-label={`Remove ${patient.name} from ${doctor.name}'s patient list`}
                            title="Delete patient"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>

      {isPatientModalOpen && (
        <PatientFormModal
          patient={null}
          doctors={[doctor]}
          defaultDoctorId={doctor._id}
          lockDoctor
          onClose={() => setIsPatientModalOpen(false)}
          onCreated={() => setPage(1)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete patient?"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.name} from ${doctor.name}’s patient records? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete patient"
        isPending={remove.isPending}
        errorMessage={
          remove.error
            ? getApiErrorMessage(remove.error, 'Could not delete this patient. Please try again.')
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-pine-600" size={19} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <div className="mt-1 break-words text-sm font-medium text-ink">{children}</div>
      </div>
    </div>
  );
}

function DoctorDetailsSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading doctor profile…</span>
      <div className="h-5 w-32 animate-pulse rounded bg-line" />
      <div className="surface-card h-52 animate-pulse bg-white/60" />
      <div className="surface-card h-64 animate-pulse bg-white/60" />
    </div>
  );
}
