import type { ReactNode } from 'react';

const TONES = {
  pine: 'bg-pine-50 text-pine-800 ring-pine-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
} as const;

type Tone = keyof typeof TONES;

const AUTO_TONES: Tone[] = ['pine', 'amber', 'indigo', 'rose', 'sky', 'violet'];

/**
 * Conditions are free text, so colours cannot be hard-coded per value.
 * Hashing the label gives each condition a stable colour everywhere it appears.
 */
export function toneFor(label: string): Tone {
  const key = label.trim().toLowerCase();
  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return AUTO_TONES[hash % AUTO_TONES.length];
}

interface BadgeProps {
  children: ReactNode;
  tone?: Tone | 'auto';
}

export function Badge({ children, tone = 'pine' }: BadgeProps) {
  const label = typeof children === 'string' ? children : undefined;
  const resolved: Tone = tone === 'auto' ? toneFor(label ?? '') : tone;

  return (
    <span
      title={label}
      className={`inline-block max-w-[16rem] truncate rounded-full px-2.5 py-1 align-middle text-xs font-medium ring-1 ring-inset ${TONES[resolved]}`}
    >
      {children}
    </span>
  );
}
