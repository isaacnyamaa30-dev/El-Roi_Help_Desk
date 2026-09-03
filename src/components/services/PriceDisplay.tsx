import { formatMoney } from '../../utils/format'
import type { ResolvedPrice } from '../../types'

export function PriceDisplay({
  price,
  size = 'md',
}: {
  price: ResolvedPrice
  size?: 'sm' | 'md' | 'lg'
}) {
  const cls =
    size === 'lg'
      ? 'text-2xl font-bold'
      : size === 'sm'
        ? 'text-sm font-semibold'
        : 'text-lg font-bold'

  if (price.isQuote || price.amount === null) {
    return (
      <span
        className={`${cls === 'text-sm font-semibold' ? 'text-sm font-semibold' : 'text-base font-semibold'} text-gold-dark`}
      >
        Request Quote
      </span>
    )
  }

  return (
    <span className={`${cls} font-display text-navy`}>
      {formatMoney(price.amount)}
      {price.unit ? (
        <span className="ml-1 text-xs font-normal text-ink-soft">
          {price.unit}
        </span>
      ) : null}
    </span>
  )
}
