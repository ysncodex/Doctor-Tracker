'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

import { AppShell } from '@/components/layout/app-shell';
import { ErrorState } from '@/components/shared/data-states';
import { FullPageSpinner } from '@/components/shared/full-page-spinner';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isFetching, isError, error, refetch } = useAuth();

  const sessionExpired = isError && isAxiosError(error) && error.response?.status === 401;
  const serverProblem = isError && !sessionExpired;
  const shouldRedirect = !isLoading && !serverProblem && (!user || sessionExpired);

  useEffect(() => {
    if (shouldRedirect) router.replace('/login');
  }, [shouldRedirect, router]);

  if (serverProblem && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="surface-card w-full max-w-md">
          <ErrorState
            title="We couldn’t verify your session"
            description="The server didn’t respond. Check your connection and try again."
            onRetry={() => refetch()}
            isRetrying={isFetching}
          >
            <Link href="/login" className="btn-secondary">
              Go to sign in
            </Link>
          </ErrorState>
        </div>
      </div>
    );
  }

  if (isLoading || shouldRedirect || !user) {
    return <FullPageSpinner label="Checking your session…" />;
  }

  return <AppShell>{children}</AppShell>;
}
