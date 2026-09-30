import { formatMoney } from '@/lib/format'

/** Muestra un monto MXN; resalta adeudo (>0) o saldo a favor (<0). */
export function MoneyText({
  amount,
  highlightDebt = false,
}: {
  amount: string | number
  highlightDebt?: boolean
}) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  let color: string | undefined
  if (highlightDebt) {
    if (n > 0) color = 'var(--loss)'
    else if (n < 0) color = 'var(--field)'
  }
  return (
    <span className="tnum" style={{ color, fontWeight: highlightDebt ? 700 : undefined }}>
      {formatMoney(amount)}
    </span>
  )
}
