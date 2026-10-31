'use client';

import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { DateRangeFilter } from '@/components/shared/date-range-filter';
import { FilterPanel } from '@/components/shared/filter-panel';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/shared/data-states';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconButton, iconActionClass } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { SelectField } from '@/components/ui/select';
import { DoctorFormModal } from '@/components/doctors/doctor-form-modal';
import { useDoctorMutations, useDoctors } from '@/hooks/use-doctors';
import { useDoctorFilterOptions } from '@/hooks/use-filter-options';
import { useClampPage, useListFilters } from '@/hooks/use-list-filters';
import { getApiErrorMessage } from '@/lib/api-error';
import { PAGE_SIZE, SORT_OPTIONS } from '@/lib/constants';
import { withSelected } from '@/lib/options';
import { formatDate, getInitial, pluralize } from '@/lib/format';
import type { Doctor } from '@/types';

export default function DoctorsPage() {
  const list = useListFilters({
    specialization: '',
    hospital: '',
    sort: 'newest',
    startDate: '',
    endDate: '',
  });
  const { filters, setFilter, page, setPage } = list;

  const [formTarget, setFormTarget] = useState<{ doctor: Doctor | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useDoctors({
    ...list.params,
    limit: PAGE_SIZE,
  });
  const { remove } = useDoctorMutations();
  const optionsQuery = useDoctorFilterOptions();

  const specializations = withSelected(optionsQuery.data?.specializations, filters.specialization);
  const hospitals = withSelected(optionsQuery.data?.hospitals, filters.hospital);

  const pagination = data?.pagination;
  useClampPage(page, pagination?.totalPages, setPage);

  const isRefreshing = isFetching && !isLoading;
  const activeFilterCount = [
    filters.specialization,
    filters.hospital,
    filters.startDate || filters.endDate,
    filters.sort !== 'newest' ? filters.sort : '',
  ].filter(Boolean).length;
  const resetDeleteMutation = remove.reset;

  const openEdit = useCallback((doctor: Doctor) => setFormTarget({ doctor }), []);
  const askDelete = useCallback(
    (doctor: Doctor) => {
      resetDeleteMutation();
      setDeleteTarget(doctor);
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
        title="Doctors"
        description="Manage doctors and their associated patients."
        action={
          <button
            type="button"
            onClick={() => setFormTarget({ doctor: null })}
            className="btn-primary"
          >
            <Plus size={17} aria-hidden="true" />
            Add doctor
          </button>
        }
      />

      <FilterPanel
        gridClassName="xl:grid-cols-4"
        activeCount={activeFilterCount}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
        search={
          <SearchInput
            label="Search"
            placeholder="Name, specialization, hospital…"
            value={list.searchInput}
            onChange={list.setSearchInput}
          />
        }
        fields={
          <>
            <SelectField
              label="Specialization"
              value={filters.specialization}
              onChange={(value) => setFilter('specialization', value)}
            >
              <option value="">All specializations</option>
              {specializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Hospital"
              value={filters.hospital}
              onChange={(value) => setFilter('hospital', value)}
            >
              <option value="">All hospitals</option>
              {hospitals.map((item) => (
                <option key={item} value={item}>
                  {item}
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
            label="Joined"
            value={{ startDate: filters.startDate, endDate: filters.endDate }}
            onChange={(range) => {
              setFilter('startDate', range.startDate);
              setFilter('endDate', range.endDate);
            }}
          />
        }
      />

      <section aria-labelledby="doctor-directory-title" className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="doctor-directory-title" className="font-display text-lg font-semibold text-ink">
              Doctor directory
            </h2>
            <p className="mt-0.5 text-sm text-muted" aria-live="polite">
              {pluralize(pagination?.total ?? 0, 'doctor')}
              {list.hasActiveFilters ? ' match your filters' : ' registered'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError && !data ? (
          <ErrorState
            title="We couldn’t load doctors"
            description="Check your connection and try again."
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : !data?.data.length ? (
          list.hasActiveFilters ? (
            <EmptyState
              icon={Stethoscope}
              title="No doctors match your filters"
              description="Try a different search or clear the filters."
            >
              <button type="button" onClick={list.reset} className="btn-secondary">
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <EmptyState
              icon={Stethoscope}
              title="No doctors yet"
              description="Add your first doctor to get started."
            >
              <button
                type="button"
                onClick={() => setFormTarget({ doctor: null })}
                className="btn-primary"
              >
                <Plus size={16} aria-hidden="true" /> Add doctor
              </button>
            </EmptyState>
          )
        ) : (
          <>
            <div
              aria-busy={isRefreshing}
              className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}
            >
              <ul className="grid gap-3 p-4 md:grid-cols-2 xl:hidden">
                {data.data.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onEdit={openEdit}
                    onDelete={askDelete}
                  />
                ))}
              </ul>

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <caption className="sr-only">Doctors</caption>
                  <thead className="bg-paper text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Doctor
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Specialization
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Hospital
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Phone
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {data.data.map((doctor) => (
                      <DoctorRow
                        key={doctor._id}
                        doctor={doctor}
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
        <DoctorFormModal
          doctor={formTarget.doctor}
          onClose={() => setFormTarget(null)}
          onCreated={() => setPage(1)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete doctor?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete doctor"
        isPending={remove.isPending}
        errorMessage={
          remove.isError
            ? getApiErrorMessage(remove.error, 'Could not delete this doctor. Please try again.')
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

interface DoctorRowProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

const DoctorRow = memo(function DoctorRow({ doctor, onEdit, onDelete }: DoctorRowProps) {
  return (
    <tr className="transition-colors hover:bg-pine-50/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-50 font-display text-lg font-semibold text-pine-700"
          >
            {getInitial(doctor.name)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/doctors/${doctor._id}`}
              className="font-medium text-ink hover:text-pine-700 hover:underline"
            >
              {doctor.name}
            </Link>
            <p className="mt-0.5 truncate text-xs text-muted">{doctor.email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <Badge>{doctor.specialization}</Badge>
      </td>

      <td className="px-5 py-4 text-ink/80">{doctor.hospital}</td>
      <td className="whitespace-nowrap px-5 py-4 text-ink/80">{doctor.phone}</td>
      <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(doctor.createdAt)}</td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Link
            href={`/doctors/${doctor._id}`}
            aria-label={`View ${doctor.name}`}
            title="View details"
            className={iconActionClass()}
          >
            <Eye size={16} aria-hidden="true" />
          </Link>

          <IconButton label={`Edit ${doctor.name}`} onClick={() => onEdit(doctor)}>
            <Pencil size={16} aria-hidden="true" />
          </IconButton>

          <IconButton
            label={`Delete ${doctor.name}`}
            tone="danger"
            onClick={() => onDelete(doctor)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
});

const DoctorCard = memo(function DoctorCard({ doctor, onEdit, onDelete }: DoctorRowProps) {
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-50 font-display text-lg font-semibold text-pine-700"
        >
          {getInitial(doctor.name)}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/doctors/${doctor._id}`}
            className="block truncate font-medium text-ink hover:text-pine-700 hover:underline"
          >
            {doctor.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">{doctor.email}</p>

          <div className="mt-2.5">
            <Badge>{doctor.specialization}</Badge>
          </div>

          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted">Hospital</dt>
              <dd className="min-w-0 text-ink/80">{doctor.hospital}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted">Phone</dt>
              <dd className="min-w-0 text-ink/80">{doctor.phone}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
        <span className="text-xs text-muted">Joined {formatDate(doctor.createdAt)}</span>

        <div className="flex gap-1">
          <Link
            href={`/doctors/${doctor._id}`}
            aria-label={`View ${doctor.name}`}
            title="View details"
            className={iconActionClass()}
          >
            <Eye size={16} aria-hidden="true" />
          </Link>

          <IconButton label={`Edit ${doctor.name}`} onClick={() => onEdit(doctor)}>
            <Pencil size={16} aria-hidden="true" />
          </IconButton>

          <IconButton
            label={`Delete ${doctor.name}`}
            tone="danger"
            onClick={() => onDelete(doctor)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </li>
  );
});
