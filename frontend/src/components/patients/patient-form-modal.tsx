'use client';

import { useId, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { usePatientMutations } from '@/hooks/use-patients';
import { usePatientFilterOptions } from '@/hooks/use-filter-options';
import { GENDERS, SUGGESTED_CONDITIONS } from '@/lib/constants';
import { mergeSuggestions } from '@/lib/options';
import { getDoctorId, getDoctorName } from '@/lib/patients';
import { getApiErrorMessage } from '@/lib/api-error';
import type { DoctorOption, Patient } from '@/types';

type PatientFormState = {
  doctorId: string;
  name: string;
  age: string;
  gender: Patient['gender'];
  phone: string;
  condition: string;
};

const EMPTY_FORM: PatientFormState = {
  doctorId: '',
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  condition: '',
};

function toForm(patient: Patient | null, defaultDoctorId?: string): PatientFormState {
  if (!patient) return { ...EMPTY_FORM, doctorId: defaultDoctorId ?? '' };

  return {
    doctorId: getDoctorId(patient.doctorId),
    name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    phone: patient.phone,
    condition: patient.condition,
  };
}

interface PatientFormModalProps {
  patient: Patient | null;
  doctors: DoctorOption[];
  isLoadingDoctors?: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultDoctorId?: string;
  lockDoctor?: boolean;
}

export function PatientFormModal({
  patient,
  doctors,
  isLoadingDoctors = false,
  onClose,
  onCreated,
  defaultDoctorId,
  lockDoctor = false,
}: PatientFormModalProps) {
  const uid = useId();
  const { create, update } = usePatientMutations();
  const conditionOptions = usePatientFilterOptions();
  const conditionSuggestions = mergeSuggestions(
    SUGGESTED_CONDITIONS,
    conditionOptions.data?.conditions
  );
  const [form, setForm] = useState<PatientFormState>(() => toForm(patient, defaultDoctorId));

  const isSaving = create.isPending || update.isPending;
  const mutationError = create.error ?? update.error;
  const errorMessage = mutationError
    ? getApiErrorMessage(
        mutationError,
        'Could not save patient. Please check the information and try again.'
      )
    : null;

  const missingDoctorOption =
    form.doctorId && !doctors.some((doctor) => doctor._id === form.doctorId)
      ? (getDoctorName(patient?.doctorId) ?? 'Current doctor')
      : null;

  function set<K extends keyof PatientFormState>(key: K, value: PatientFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      condition: form.condition.trim(),
      age: Number(form.age),
    };

    if (patient) {
      update.mutate({ id: patient._id, data: payload }, { onSuccess: () => onClose() });
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onClose();
          onCreated?.();
        },
      });
    }
  }

  return (
    <Modal
      open
      title={patient ? 'Edit patient' : 'Add new patient'}
      description="Enter the patient’s information."
      onClose={onClose}
      dismissible={!isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <Field label="Full name" htmlFor={`${uid}-name`}>
          <input
            id={`${uid}-name`}
            required
            minLength={2}
            maxLength={100}
            autoComplete="off"
            data-autofocus=""
            className="input-field"
            placeholder="Patient full name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Age" htmlFor={`${uid}-age`}>
            <input
              id={`${uid}-age`}
              required
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              step={1}
              className="input-field"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
            />
          </Field>

          <Field label="Gender" htmlFor={`${uid}-gender`}>
            <select
              id={`${uid}-gender`}
              className="input-field"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value as Patient['gender'])}
            >
              {GENDERS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Phone" htmlFor={`${uid}-phone`}>
          <input
            id={`${uid}-phone`}
            required
            type="tel"
            minLength={7}
            maxLength={20}
            autoComplete="off"
            className="input-field"
            placeholder="Patient phone number"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>

        <Field
          label="Medical condition"
          htmlFor={`${uid}-condition`}
          hint="Pick a suggestion or type a new condition. New conditions appear in the filters automatically."
        >
          <input
            id={`${uid}-condition`}
            required
            minLength={2}
            maxLength={60}
            autoComplete="off"
            list={`${uid}-conditions`}
            className="input-field"
            placeholder="e.g. Diabetes"
            value={form.condition}
            onChange={(e) => set('condition', e.target.value)}
          />
          <datalist id={`${uid}-conditions`}>
            {conditionSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>

        <Field label="Assigned doctor" htmlFor={`${uid}-doctor`}>
          <select
            id={`${uid}-doctor`}
            required
            disabled={lockDoctor}
            className="input-field disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted"
            value={form.doctorId}
            onChange={(e) => set('doctorId', e.target.value)}
          >
            <option value="">{isLoadingDoctors ? 'Loading doctors…' : 'Select a doctor'}</option>
            {missingDoctorOption && <option value={form.doctorId}>{missingDoctorOption}</option>}
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} · {doctor.specialization}
              </option>
            ))}
          </select>
        </Field>

        {errorMessage && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button type="submit" disabled={isSaving || isLoadingDoctors} className="btn-primary">
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : patient ? (
              'Save changes'
            ) : (
              'Create patient'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
