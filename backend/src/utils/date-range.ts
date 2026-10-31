import { ApiError } from './ApiError.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T/;

export interface DateRange {
  $gte?: Date;
  $lte?: Date;
}

function parseBoundary(value: unknown, boundary: 'start' | 'end', label: string): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  if (typeof value !== 'string') {
    throw new ApiError(400, `Invalid ${label}`);
  }

  const text = value.trim();
  let date: Date;

  if (DATE_ONLY.test(text)) {
    date = new Date(`${text}T${boundary === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`);

    if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) !== text) {
      throw new ApiError(400, `Invalid ${label}`);
    }
  } else if (ISO_INSTANT.test(text)) {
    date = new Date(text);
  } else {
    throw new ApiError(400, `Invalid ${label}`);
  }

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  return date;
}

export function buildDateRange(startDate: unknown, endDate: unknown): DateRange | undefined {
  const start = parseBoundary(startDate, 'start', 'startDate');
  const end = parseBoundary(endDate, 'end', 'endDate');

  if (!start && !end) return undefined;

  if (start && end && start > end) {
    throw new ApiError(400, 'startDate must be before endDate');
  }

  const range: DateRange = {};
  if (start) range.$gte = start;
  if (end) range.$lte = end;

  return range;
}
