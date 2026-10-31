'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { isAxiosError } from 'axios';
import { BrandMark } from '@/components/shared/brand-mark';
import { useAuth, useLogin } from '@/hooks/use-auth';

// Pre-fill the demo account only during local development.
const DEFAULT_EMAIL = process.env.NODE_ENV === 'development' ? 'admin@doctortracker.com' : '';

export default function LoginPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const login = useLogin();

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  function clearError() {
    if (login.isError) login.reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (login.isPending) return;
    login.mutate({ email: email.trim(), password });
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState('CapsLock'));
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pine-600 border-t-transparent" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  const hasError = login.isError;
  const isRateLimited = isAxiosError(login.error) && login.error.response?.status === 429;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-pine-900 p-12 text-white lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <span className="font-display text-2xl font-semibold tracking-tight">Doctor Tracker</span>
        </div>

        {/* ECG trace: the one decorative element, drawn once on load */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-48 w-full -translate-y-1/2 opacity-40"
          fill="none"
        >
          <path
            className="ecg-trace"
            pathLength={1}
            d="M0 100 H210 L240 100 L262 38 L292 168 L318 66 L340 100 H500 L528 100 L550 22 L582 180 L610 100 H800"
            stroke="#78b8ab"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight">
            Every doctor and patient record, in one clear view.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-pine-200/80">
            Search, filter and manage your clinic’s records, and see how your caseload is changing.
          </p>
        </div>

        <p className="relative z-10 text-sm text-pine-300/70">
          © {new Date().getFullYear()} Doctor Tracker. All rights reserved.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 font-semibold text-ink lg:hidden">
            <span className="rounded-[10px] bg-pine-900 p-px">
              <BrandMark className="h-9 w-9" />
            </span>
            <span className="font-display text-xl">Doctor Tracker</span>
          </div>

          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your administration dashboard.
          </p>

          <form onSubmit={handleSubmit} noValidate={false} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
                Email address
              </label>
              <div className="group relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-pine-700"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoFocus={!email}
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? 'login-error' : undefined}
                  className="input-field h-11 pl-10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
                Password
              </label>
              <div className="group relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-pine-700"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoFocus={!!email}
                  required
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  onKeyDown={handleKey}
                  onKeyUp={handleKey}
                  onBlur={() => setCapsLockOn(false)}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? 'login-error' : undefined}
                  className="input-field h-11 pl-10 pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {capsLockOn && (
                <p className="mt-2 text-xs text-amber-600" role="status">
                  Caps Lock is on.
                </p>
              )}
            </div>

            {hasError && (
              <div
                id="login-error"
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {isRateLimited
                    ? 'Too many sign-in attempts. Wait a few minutes, then try again.'
                    : 'We couldn’t sign you in. Check your email and password, then try again.'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending || !email || !password}
              className="btn-primary h-11 w-full"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">Authorized administrators only.</p>
        </div>
      </section>
    </main>
  );
}
