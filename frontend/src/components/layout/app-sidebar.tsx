'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Stethoscope, Users, X } from 'lucide-react';

import { BrandMark } from '@/components/shared/brand-mark';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { getInitial } from '@/lib/format';

const navigation = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Manage',
    items: [
      { name: 'Doctors', href: '/doctors', icon: Stethoscope },
      { name: 'Patients', href: '/patients', icon: Users },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: user } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-pine-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="app-navigation"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col bg-pine-900 text-pine-100 transition-[transform,visibility] duration-200 lg:visible lg:translate-x-0 ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between px-6">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 rounded-md">
            <BrandMark />
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              Doctor Tracker
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-pine-200 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-xs font-medium text-pine-300/80">{group.label}</p>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-white/10 text-white'
                            : 'text-pine-100/75 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-pine-300"
                          />
                        )}
                        <Icon
                          size={18}
                          aria-hidden="true"
                          className={active ? 'text-pine-200' : 'text-pine-300/70'}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-700 font-display text-base font-semibold text-white"
            >
              {getInitial(user?.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name ?? 'Administrator'}
              </p>
              <p className="truncate text-xs text-pine-300/80">{user?.email ?? 'Administrator'}</p>
            </div>

            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-pine-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
