/** Logo mark: a heartbeat line in a rounded square. Echoes the trace on the sign-in page. */
export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      className={className}
      fill="none"
    >
      <rect width="36" height="36" rx="10" fill="#ffffff" />
      <path
        d="M5 19.5h6.5l3-8.5 5 15 3.5-9.5H31"
        stroke="#0b5a51"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
