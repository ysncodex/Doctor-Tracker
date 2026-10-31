export type DatePresetId = 'today' | '7d' | '30d' | 'month' | '90d';

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: '90d', label: 'Last 90 days' },
];

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

export function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getPresetRange(id: DatePresetId, now: Date = new Date()): DateRangeValue {
  const end = toInputDate(now);
  const daysBack = (days: number) =>
    toInputDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days));

  switch (id) {
    case 'today':
      return { startDate: end, endDate: end };
    case '7d':
      return { startDate: daysBack(6), endDate: end };
    case '30d':
      return { startDate: daysBack(29), endDate: end };
    case '90d':
      return { startDate: daysBack(89), endDate: end };
    case 'month':
      return {
        startDate: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: end,
      };
  }
}

function parseInputDate(value: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function startOfLocalDay(value: string): string | undefined {
  const parts = parseInputDate(value);
  if (!parts) return undefined;

  const date = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function endOfLocalDay(value: string): string | undefined {
  const parts = parseInputDate(value);
  if (!parts) return undefined;

  const date = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function toDateParams(startDate: string, endDate: string) {
  return {
    startDate: startDate ? startOfLocalDay(startDate) : undefined,
    endDate: endDate ? endOfLocalDay(endDate) : undefined,
  };
}
