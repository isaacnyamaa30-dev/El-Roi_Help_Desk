export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500"
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-300 border-t-royal" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
