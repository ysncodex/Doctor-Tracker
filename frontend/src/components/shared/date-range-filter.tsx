'use client';

import { useId } from 'react';

import { DATE_PRESETS, getPresetRange, toInputDate, type DateRangeValue } from '@/lib/date-range';

interface DateRangeFilterProps {
  label: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function DateRangeFilter({ label, value, onChange }: DateRangeFilterProps) {
  const uid = useId();
  const today = toInputDate(new Date());

  function setStart(startDate: string) {
    onChange({
      startDate,
      endDate: value.endDate && startDate > value.endDate ? startDate : value.endDate,
    });
  }

  function setEnd(endDate: string) {
    onChange({
      startDate: value.startDate && endDate < value.startDate ? endDate : value.startDate,
      endDate,
    });
  }

  const hasRange = Boolean(value.startDate || value.endDate);

  return (
    <fieldset className="min-w-0">
      <legend className="field-label">{label} between</legend>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} quick ranges`}>
          {DATE_PRESETS.map((preset) => {
            const range = getPresetRange(preset.id);
            const active = value.startDate === range.startDate && value.endDate === range.endDate;

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? { startDate: '', endDate: '' } : range)}
                className={`h-9 rounded-full border px-3 text-xs font-medium transition-colors ${
                  active
                    ? 'border-pine-700 bg-pine-700 text-white'
                    : 'border-line-strong bg-white text-ink hover:border-pine-300 hover:bg-pine-50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto lg:flex-nowrap">
          <label htmlFor={`${uid}-from`} className="sr-only">
            {label} from
          </label>
          <input
            id={`${uid}-from`}
            type="date"
            className="input-field h-9 min-w-[8.5rem] flex-1 lg:w-[9.5rem] lg:flex-none"
            value={value.startDate}
            max={value.endDate || today}
            onChange={(event) => setStart(event.target.value)}
          />

          <span aria-hidden="true" className="text-muted">
            to
          </span>

          <label htmlFor={`${uid}-to`} className="sr-only">
            {label} until
          </label>
          <input
            id={`${uid}-to`}
            type="date"
            className="input-field h-9 min-w-[8.5rem] flex-1 lg:w-[9.5rem] lg:flex-none"
            value={value.endDate}
            min={value.startDate || undefined}
            max={today}
            onChange={(event) => setEnd(event.target.value)}
          />

          {hasRange && (
            <button
              type="button"
              onClick={() => onChange({ startDate: '', endDate: '' })}
              className="shrink-0 rounded-md px-1.5 py-1 text-xs font-medium text-pine-700 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </fieldset>
  );
}
