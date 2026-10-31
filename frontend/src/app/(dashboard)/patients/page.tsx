'use client';

import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { DateRangeFilter } from '@/components/shared/date-range-filter';
import { FilterPanel } from '@/components/shared/filter-panel';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/shared/data-states';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { SelectField } from '@/components/ui/select';
import { PatientFormModal } from '@/components/patients/patient-form-modal';
import { useDoctorOptions } from '@/hooks/use-doctor-options';
import { usePatientFilterOptions } from '@/hooks/use-filter-options';
import { useClampPage, useListFilters } from '@/hooks/use-list-filters';
import { usePatientMutations, usePatients } from '@/hooks/use-patients';
import { getApiErrorMessage } from '@/lib/api-error';
import { GENDERS, PAGE_SIZE, SORT_OPTIONS } from '@/lib/constants';
import { withSelected } from '@/lib/options';
import { formatDate, pluralize } from '@/lib/format';
import { getDoctorId, getDoctorName } from '@/lib/patients';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const list = useListFilters({
    condition: '',
    gender: '',
    doctorId: '',
    sort: 'newest',
    startDate: '',
    endDate: '',
  });
  const { filters, setFilter, page, setPage } = list;

  const [formTarget, setFormTarget] = useState<{ patient: Patient | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = usePatients({
    ...list.params,
    limit: PAGE_SIZE,
  });
  const { remove } = usePatientMutations();
  const doctorsQuery = useDoctorOptions();
  const optionsQuery = usePatientFilterOptions();

  const doctors = doctorsQuery.data ?? [];
  const conditions = withSelected(optionsQuery.data?.conditions, filters.condition);
  const canAddPatient = doctors.length > 0;
  const addDisabledReason = doctorsQuery.isLoading
    ? 'Loading doctors…'
    : !canAddPatient
      ? 'Add a doctor first'
      : undefined;

  const pagination = data?.pagination;
  useClampPage(page, pagination?.totalPages, setPage);

  const isRefreshing = isFetching && !isLoading;
  const activeFilterCount = [
    filters.condition,
    filters.gender,
    filters.doctorId,
    filters.startDate || filters.endDate,
    filters.sort !== 'newest' ? filters.sort : '',
  ].filter(Boolean).length;

  function openCreate() {
    if (canAddPatient) setFormTarget({ patient: null });
  }

  const resetDeleteMutation = remove.reset;

  const openEdit = useCallback((patient: Patient) => setFormTarget({ patient }), []);
  const askDelete = useCallback(
    (patient: Patient) => {
      resetDeleteMutation();
      setDeleteTarget(patient);
    },
    [resetDeleteMutation]
  );

  function closeDelete() {
    if (remove.isPending) return;
    remove.reset();
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Manage patient records and their assigned doctors."
        action={
          <button
            type="button"
            onClick={openCreate}
            disabled={!canAddPatient}
            title={addDisabledReason}
            className="btn-primary"
          >
            <Plus size={17} aria-hidden="true" /> Add patient
          </button>
        }
      />

      {doctorsQuery.isError ? (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span>
            We couldn’t load the doctor list, so patients can’t be added or filtered by doctor.
          </span>
          <button
            type="button"
            onClick={() => doctorsQuery.refetch()}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : (
        doctorsQuery.isSuccess &&
        !canAddPatient && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Every patient needs an assigned doctor.{' '}
            <Link href="/doctors" className="font-medium underline underline-offset-2">
              Add a doctor
            </Link>{' '}
            before creating patients.
          </div>
        )
      )}

      <FilterPanel
        gridClassName="xl:grid-cols-5"
        activeCount={activeFilterCount}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
        search={
          <SearchInput
            label="Search"
            placeholder="Name or phone number…"
            value={list.searchInput}
            onChange={list.setSearchInput}
          />
        }
        fields={
          <>
            <SelectField
              label="Condition"
              value={filters.condition}
              onChange={(value) => setFilter('condition', value)}
            >
              <option value="">All conditions</option>
              {conditions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Gender"
              value={filters.gender}
              onChange={(value) => setFilter('gender', value)}
            >
              <option value="">All genders</option>
              {GENDERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Doctor"
              value={filters.doctorId}
              onChange={(value) => setFilter('doctorId', value)}
            >
              <option value="">All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Sort by"
              value={filters.sort}
              onChange={(value) => setFilter('sort', value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </>
        }
        dateFilter={
          <DateRangeFilter
            label="Registered"
            value={{ startDate: filters.startDate, endDate: filters.endDate }}
            onChange={(range) => {
              setFilter('startDate', range.startDate);
              setFilter('endDate', range.endDate);
            }}
          />
        }
      />

      <section aria-labelledby="patient-directory-title" className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2
              id="patient-directory-title"
              className="font-display text-lg font-semibold text-ink"
            >
              Patient directory
            </h2>
            <p className="mt-0.5 text-sm text-muted" aria-live="polite">
              {pluralize(pagination?.total ?? 0, 'patient')}
              {list.hasActiveFilters ? ' match your filters' : ' registered'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError && !data ? (
          <ErrorState
            title="We couldn’t load patients"
            description="Check your connection and try again."
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : !data?.data.length ? (
          list.hasActiveFilters ? (
            <EmptyState
              icon={Users}
              title="No patients match your filters"
              description="Try a different search or clear the filters."
            >
              <button type="button" onClick={list.reset} className="btn-secondary">
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <EmptyState
              icon={Users}
              title="No patients yet"
              description={
                canAddPatient
                  ? 'Add your first patient to get started.'
                  : 'Add a doctor first, then register patients.'
              }
            >
              {canAddPatient ? (
                <button type="button" onClick={openCreate} className="btn-primary">
                  <Plus size={16} aria-hidden="true" /> Add patient
                </button>
              ) : (
                <Link href="/doctors" className="btn-secondary">
                  Go to doctors
                </Link>
              )}
            </EmptyState>
          )
        ) : (
          <>
            <div
              aria-busy={isRefreshing}
              className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}
            >
              <ul className="grid gap-3 p-4 md:grid-cols-2 xl:hidden">
                {data.data.map((patient) => (
                  <PatientCard
                    key={patient._id}
                    patient={patient}
                    onEdit={openEdit}
                    onDelete={askDelete}
                  />
                ))}
              </ul>

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <caption className="sr-only">Patients</caption>
                  <thead className="bg-paper text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Patient
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Condition
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Phone
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Assigned doctor
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {data.data.map((patient) => (
                      <PatientRow
                        key={patient._id}
                        patient={patient}
                        onEdit={openEdit}
                        onDelete={askDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && (
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

      {formTarget && (
        <PatientFormModal
          patient={formTarget.patient}
          doctors={doctors}
          isLoadingDoctors={doctorsQuery.isLoading}
          onClose={() => setFormTarget(null)}
          onCreated={() => setPage(1)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete patient?"
        description={
          deleteTarget
            ? `${deleteTarget.name}’s record will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete patient"
        isPending={remove.isPending}
        errorMessage={
          remove.isError
            ? getApiErrorMessage(remove.error, 'Could not delete this patient. Please try again.')
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

function DoctorCell({ doctorId }: { doctorId: Patient['doctorId'] }) {
  const name = getDoctorName(doctorId);
  const id = getDoctorId(doctorId);

  if (!name || !id) return <span className="text-muted">—</span>;

  return (
    <Link href={`/doctors/${id}`} className="text-ink/80 hover:text-pine-700 hover:underline">
      {name}
    </Link>
  );
}

interface PatientRowProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const PatientRow = memo(function PatientRow({ patient, onEdit, onDelete }: PatientRowProps) {
  return (
    <tr className="transition-colors hover:bg-pine-50/50">
      <td className="px-6 py-4">
        <p className="font-medium text-ink">{patient.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {patient.age} years · {patient.gender}
        </p>
      </td>

      <td className="px-5 py-4">
        <Badge tone="auto">{patient.condition}</Badge>
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-ink/80">{patient.phone}</td>

      <td className="whitespace-nowrap px-5 py-4">
        <DoctorCell doctorId={patient.doctorId} />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(patient.createdAt)}</td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <IconButton label={`Edit ${patient.name}`} onClick={() => onEdit(patient)}>
            <Pencil size={16} aria-hidden="true" />
          </IconButton>

          <IconButton
            label={`Delete ${patient.name}`}
            tone="danger"
            onClick={() => onDelete(patient)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
});

const PatientCard = memo(function PatientCard({ patient, onEdit, onDelete }: PatientRowProps) {
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
          <dt className="w-16 shrink-0 text-muted">Phone</dt>
          <dd className="min-w-0 text-ink/80">{patient.phone}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">Doctor</dt>
          <dd className="min-w-0">
            <DoctorCell doctorId={patient.doctorId} />
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
        <span className="text-xs text-muted">Registered {formatDate(patient.createdAt)}</span>

        <div className="flex gap-1">
          <IconButton label={`Edit ${patient.name}`} onClick={() => onEdit(patient)}>
            <Pencil size={16} aria-hidden="true" />
          </IconButton>

          <IconButton
            label={`Delete ${patient.name}`}
            tone="danger"
            onClick={() => onDelete(patient)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </li>
  );
});
