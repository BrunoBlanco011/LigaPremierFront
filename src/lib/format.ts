// Formato local de la liga (español de México, MXN).

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const dateLong = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateShort = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
})

const time = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
})

/** El dinero llega como texto ("700.00"); se formatea sin perder precisión. */
export function formatMoney(amount: string | number): string {
  const n = typeof amount === 'string' ? Number(amount) : amount
  return Number.isFinite(n) ? money.format(n) : '—'
}

/** Una fecha sola ("2026-05-18") es un día del calendario: se lee en hora local, no en UTC. */
function parseDate(iso: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso)
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Por definir'
  return dateLong.format(parseDate(iso))
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return '—'
  return dateShort.format(parseDate(iso))
}

/** Fechas de una jornada: "18 de mayo de 2026" o "18 de mayo de 2026 – 20 de mayo de 2026". */
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end || start === end) return formatDate(start ?? end)
  return `${formatDate(start)} – ${formatDate(end)}`
}

/** Timestamp de la API → valor de un <input type="datetime-local"> en hora local. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatTime(iso: string | null): string {
  if (!iso) return ''
  return time.format(new Date(iso))
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return 'Por definir'
  return `${dateLong.format(new Date(iso))} · ${time.format(new Date(iso))}`
}

/** Iniciales para el escudo cuando no hay logo. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
