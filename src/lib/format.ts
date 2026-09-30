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

export function formatDate(iso: string | null): string {
  if (!iso) return 'Por definir'
  return dateLong.format(new Date(iso))
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return '—'
  return dateShort.format(new Date(iso))
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
