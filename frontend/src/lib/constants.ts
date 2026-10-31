export const PAGE_SIZE = 10;

export const SUGGESTED_SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
] as const;

export const SUGGESTED_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];
