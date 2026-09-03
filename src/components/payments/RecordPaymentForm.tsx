import { useState } from 'react'
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS,
} from '../../constants'
import { recordPayment } from '../../services/payments'
import { paymentState } from '../../utils/metrics'
import { useToast } from '../common/Toast'
import { formatMoney } from '../../utils/format'
import type { PaymentMethod } from '../../types'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

export function RecordPaymentForm({
  bookingId,
  total,
  paid,
  recordedBy,
  onDone,
}: {
  bookingId: string
  total: number
  paid: number
  recordedBy: string
  onDone: () => void
}) {
  const { notify } = useToast()
  const balance = Math.max(total - paid, 0)
  const [amount, setAmount] = useState(String(balance || total))
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH)
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      notify('Enter a valid payment amount.', 'error')
      return
    }
    setBusy(true)
    try {
      const newPaid = paid + value
      await recordPayment({
        bookingId,
        amount: value,
        method,
        status: paymentState(total, newPaid),
        reference,
        recordedBy,
      })
      notify(`Payment of ${formatMoney(value)} recorded.`, 'success')
      setReference('')
      onDone()
    } catch (err) {
      console.error('[EL-ROI] Payment failed:', err)
      notify('We could not record that payment. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Record a payment
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Amount ({PAYMENT_STATUS.PAID === paymentState(total, paid + Number(amount)) ? 'settles balance' : 'partial'})
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Method
          <select
            className={inputClass}
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Transaction reference (optional)
        <input
          className={inputClass}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Record Payment'}
      </button>
    </form>
  )
}
