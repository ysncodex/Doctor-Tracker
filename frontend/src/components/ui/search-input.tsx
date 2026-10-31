import { useId } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ label, placeholder, value, onChange }: SearchInputProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          type="search"
          autoComplete="off"
          className="input-field pl-9"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
