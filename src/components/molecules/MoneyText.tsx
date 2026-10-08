import { formatMoney } from '@/lib/format'

/** Muestra un monto MXN. Con `highlightDebt`, el adeudo (>0) va en rojo, el
 *  saldo a favor (<0) en azul y el 0 "al corriente" en verde. */
export function MoneyText({
  amount,
  highlightDebt = false,
  label,
}: {
  amount: string | number
  highlightDebt?: boolean
  label?: string
}) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  const kind = n > 0 ? 'debt' : n < 0 ? 'credit' : 'zero'
  const cls = highlightDebt ? `money money--${kind}` : 'money'
  return (
    <span className={cls}>
      {formatMoney(amount)}
      {label && <span className="money__label">{label}</span>}
    </span>
  )
}
