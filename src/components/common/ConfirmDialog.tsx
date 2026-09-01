import type { ReactNode } from 'react'

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body?: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {body && <div className="mt-2 text-sm text-gray-600">{body}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-royal px-3 py-1.5 text-sm font-medium text-white hover:bg-royal-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
