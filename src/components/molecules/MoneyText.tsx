import { formatMoney } from '@/lib/format'

/** Monto MXN. En modo `balance`, el significado va en texto (no solo color):
 *  "Debe $400.00" (rojo), "Al corriente" (verde) o "$200.00 a favor" (azul). */
export function MoneyText({
  amount,
  balance = false,
}: {
  amount: string | number
  balance?: boolean
}) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (!balance) return <span className="money">{formatMoney(amount)}</span>
  if (n > 0) return <span className="money money--debt">Debe {formatMoney(Math.abs(n))}</span>
  if (n < 0) return <span className="money money--credit">{formatMoney(Math.abs(n))} a favor</span>
  return <span className="money money--zero">Al corriente</span>
}
