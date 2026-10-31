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
    // A bare calendar day (YYYY-MM-DD) covers that whole UTC day.
    date = new Date(`${text}T${boundary === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`);

    // V8 silently rolls impossible days over (2026-02-31 -> 2026-03-03). Reject them.
    if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) !== text) {
      throw new ApiError(400, `Invalid ${label}`);
    }
  } else if (ISO_INSTANT.test(text)) {
    // A full ISO instant is used exactly as sent. The frontend sends the
    // start/end of the admin's *local* day, so the filter matches what they see.
    date = new Date(text);
  } else {
    throw new ApiError(400, `Invalid ${label}`);
  }

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  return date;
}

/**
 * Build a Mongo `createdAt` range from optional start/end query values.
 * Returns `undefined` when neither bound is supplied.
 */
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
