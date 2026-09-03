/** Presentation helpers. Values are stored raw in the DB and formatted here. */

import { CURRENCY_SYMBOL } from '../constants'

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** A `service_date` DATE column comes back as "2026-09-12" — keep it local. */
export function formatServiceDate(value: string | null | undefined): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** A `service_time` TIME column comes back as "10:00:00". */
export function formatServiceTime(value: string | null | undefined): string {
  if (!value) return '—'
  const [h, m] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(h ?? 0, m ?? 0, 0, 0)
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** GH₵1,000 or GH₵1,000.00 — used everywhere money is shown. */
export function formatMoney(
  amount: number | null | undefined,
  opts: { decimals?: boolean } = {},
): string {
  if (amount === null || amount === undefined) return 'Request Quote'
  const n = amount.toLocaleString('en-GH', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })
  return `${CURRENCY_SYMBOL}${n}`
}

/** Relative label such as "3 hours ago" for recent activity. */
export function timeAgo(value: string | null | undefined): string {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return formatDate(value)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Today's date as "YYYY-MM-DD" in the local timezone (for <input type=date>). */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}
