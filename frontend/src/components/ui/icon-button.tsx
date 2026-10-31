import type { ButtonHTMLAttributes } from 'react';

type Tone = 'default' | 'danger';

/** Shared classes so <Link> and <button> row actions look identical. */
export function iconActionClass(tone: Tone = 'default') {
  return [
    'inline-flex rounded-lg p-2 text-muted transition-colors',
    tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-pine-50 hover:text-pine-700',
  ].join(' ');
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: Tone;
}

export function IconButton({ label, tone = 'default', children, ...props }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} className={iconActionClass(tone)} {...props}>
      {children}
    </button>
  );
}
