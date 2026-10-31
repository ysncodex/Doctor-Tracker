import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}

/** Native <select> (best mobile + keyboard behaviour) with a visible label and a custom chevron. */
export function SelectField({ label, value, onChange, children, disabled }: SelectFieldProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="input-field appearance-none pr-9 disabled:cursor-not-allowed disabled:bg-paper"
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
