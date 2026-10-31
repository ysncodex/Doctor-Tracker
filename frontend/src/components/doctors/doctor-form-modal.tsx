'use client';

import { useId, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useDoctorMutations } from '@/hooks/use-doctors';
import { useDoctorFilterOptions } from '@/hooks/use-filter-options';
import { SUGGESTED_SPECIALIZATIONS } from '@/lib/constants';
import { mergeSuggestions } from '@/lib/options';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Doctor } from '@/types';

type DoctorForm = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};

interface FieldConfig {
  name: keyof DoctorForm;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel';
  minLength: number;
  maxLength: number;
  autoComplete?: string;
}

const FIELDS: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full name',
    placeholder: 'Dr. Ahmed Rahman',
    type: 'text',
    minLength: 2,
    maxLength: 100,
    autoComplete: 'off',
  },
  {
    name: 'specialization',
    label: 'Specialization',
    placeholder: 'Cardiology',
    type: 'text',
    minLength: 2,
    maxLength: 100,
    autoComplete: 'off',
  },
  {
    name: 'hospital',
    label: 'Hospital',
    placeholder: 'Dhaka Medical College',
    type: 'text',
    minLength: 2,
    maxLength: 150,
    autoComplete: 'off',
  },
  {
    name: 'phone',
    label: 'Phone',
    placeholder: '01712345678',
    type: 'tel',
    minLength: 7,
    maxLength: 20,
    autoComplete: 'off',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'doctor@example.com',
    type: 'email',
    minLength: 3,
    maxLength: 254,
    autoComplete: 'off',
  },
];

function toForm(doctor: Doctor | null): DoctorForm {
  return {
    name: doctor?.name ?? '',
    specialization: doctor?.specialization ?? '',
    hospital: doctor?.hospital ?? '',
    phone: doctor?.phone ?? '',
    email: doctor?.email ?? '',
  };
}

interface DoctorFormModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onCreated?: () => void;
}

export function DoctorFormModal({ doctor, onClose, onCreated }: DoctorFormModalProps) {
  const uid = useId();
  const { create, update } = useDoctorMutations();
  const [form, setForm] = useState<DoctorForm>(() => toForm(doctor));
  const optionsQuery = useDoctorFilterOptions();

  const suggestions = {
    specialization: mergeSuggestions(SUGGESTED_SPECIALIZATIONS, optionsQuery.data?.specializations),
    hospital: mergeSuggestions([], optionsQuery.data?.hospitals),
  } as const;

  const isSaving = create.isPending || update.isPending;
  const mutationError = create.error ?? update.error;
  const errorMessage = mutationError
    ? getApiErrorMessage(
        mutationError,
        'Could not save doctor. Please check the information and try again.'
      )
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const payload: DoctorForm = {
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      hospital: form.hospital.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    if (doctor) {
      update.mutate({ id: doctor._id, data: payload }, { onSuccess: () => onClose() });
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
      title={doctor ? 'Edit doctor' : 'Add new doctor'}
      description="Enter the doctor’s information."
      onClose={onClose}
      dismissible={!isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {FIELDS.map((field, index) => {
          const id = `${uid}-${field.name}`;
          const listItems =
            field.name === 'specialization' || field.name === 'hospital'
              ? suggestions[field.name]
              : undefined;

          return (
            <Field key={field.name} label={field.label} htmlFor={id}>
              <input
                id={id}
                name={field.name}
                required
                type={field.type}
                minLength={field.minLength}
                maxLength={field.maxLength}
                autoComplete={field.autoComplete}
                list={listItems ? `${uid}-${field.name}-options` : undefined}
                data-autofocus={index === 0 ? '' : undefined}
                className="input-field"
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={(e) =>
                  setForm((current) => ({ ...current, [field.name]: e.target.value }))
                }
              />
              {listItems && (
                <datalist id={`${uid}-${field.name}-options`}>
                  {listItems.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              )}
            </Field>
          );
        })}

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

          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : doctor ? (
              'Save changes'
            ) : (
              'Create doctor'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
