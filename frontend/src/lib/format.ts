const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

/** Consistent, locale-independent date display. Returns "—" for missing/invalid input. */
export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || '?';
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`;
}
