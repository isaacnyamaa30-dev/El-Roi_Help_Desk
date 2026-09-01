import type { ReactNode } from 'react'

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="font-medium text-gray-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
