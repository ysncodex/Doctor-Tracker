'use client';

import { useCallback, useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      <AppSidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="min-h-screen lg:pl-[252px]">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main id="main-content" className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
