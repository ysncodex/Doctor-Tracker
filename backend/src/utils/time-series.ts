export interface MonthlyPoint {
  year: number;
  month: number; // 1-12
  total: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD (UTC)
  total: number;
}

/** The last `count` UTC months ending with the month of `now`, oldest first, zero-filled. */
export function fillMonthlySeries(
  rows: { year: number; month: number; total: number }[],
  now: Date,
  count: number
): MonthlyPoint[] {
  const totals = new Map(rows.map((row) => [`${row.year}-${row.month}`, row.total]));

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;

    return { year, month, total: totals.get(`${year}-${month}`) ?? 0 };
  });
}

/** The last `count` UTC days ending with the day of `now`, oldest first, zero-filled. */
export function fillDailySeries(
  rows: { date: string; total: number }[],
  now: Date,
  count: number
): DailyPoint[] {
  const totals = new Map(rows.map((row) => [row.date, row.total]));

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (count - 1 - index))
    );
    const key = day.toISOString().slice(0, 10);

    return { date: key, total: totals.get(key) ?? 0 };
  });
}
