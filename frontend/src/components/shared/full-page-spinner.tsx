export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pine-600 border-t-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
