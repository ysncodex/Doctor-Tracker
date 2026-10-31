'use client';

import { Menu } from 'lucide-react';

import { BrandMark } from '@/components/shared/brand-mark';

interface HeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-controls="app-navigation"
        className="-ml-2 rounded-lg p-2 text-ink hover:bg-pine-50"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2.5">
        <span className="rounded-[10px] bg-pine-900 p-px">
          <BrandMark className="h-7 w-7" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Doctor Tracker
        </span>
      </div>
    </header>
  );
}
