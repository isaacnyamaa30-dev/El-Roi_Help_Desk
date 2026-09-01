import { useState } from 'react'
import {
  DEFAULT_PRIORITY,
  TICKET_CATEGORIES,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_OPTIONS,
} from '../../constants'
import { validateTicket, hasErrors, type Errors } from '../../utils/validation'
import type { NewTicketInput } from '../../types'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'
const errorClass = 'mt-1 text-xs text-red-600'

export function TicketForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (input: NewTicketInput) => void
  submitting: boolean
}) {
  const [form, setForm] = useState<NewTicketInput>({
    title: '',
    category: '',
    priority: DEFAULT_PRIORITY,
    description: '',
  })
  const [errors, setErrors] = useState<Errors<NewTicketInput>>({})

  function set<K extends keyof NewTicketInput>(key: K, value: NewTicketInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateTicket(form)
    setErrors(found)
    if (!hasErrors(found)) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          className={inputClass}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Unable to connect to school Wi-Fi"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className={errorClass}>{errors.title}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            className={inputClass}
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            aria-invalid={!!errors.category}
          >
            <option value="">Choose a category…</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category}</p>}
        </div>

        <div>
          <label
            htmlFor="priority"
            className="text-sm font-medium text-gray-700"
          >
            Priority
          </label>
          <select
            id="priority"
            className={inputClass}
            value={form.priority}
            onChange={(e) =>
              set('priority', e.target.value as NewTicketInput['priority'])
            }
          >
            {TICKET_PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {TICKET_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          className={inputClass}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Describe the problem, what you were trying to do, and any error message you received."
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className={errorClass}>{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Ticket'}
      </button>
    </form>
  )
}
