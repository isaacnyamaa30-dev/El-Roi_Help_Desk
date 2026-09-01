import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4">
      <div className="border-l-4 border-gold pl-3">
        <h1 className="text-xl font-bold text-navy sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
