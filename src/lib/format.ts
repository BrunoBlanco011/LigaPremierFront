// Formato local de la liga (español de México, MXN).
// Todas las horas se muestran en la zona de la liga (Chiapas, UTC-6, sin
// horario de verano), no en la del dispositivo, y en formato 24 h.

const LEAGUE_TZ = 'America/Mexico_City'
const LEAGUE_OFFSET = '-06:00' // Chiapas no usa horario de verano

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
  timeZone: LEAGUE_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const dateTime = new Intl.DateTimeFormat('es-MX', {
  timeZone: LEAGUE_TZ,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// Partes YYYY-MM-DDTHH:mm de un instante, en hora de la liga (para inputs).
const localParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: LEAGUE_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
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

/** Rango de fechas de una jornada o torneo, sin repetir año ni mes:
 *  "18 de mayo al 12 de agosto de 2026", "18 al 20 de mayo de 2026". */
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end || start === end) return formatDate(start ?? end)
  const a = parseDate(start)
  const b = parseDate(end)
  const day = new Intl.DateTimeFormat('es-MX', { day: 'numeric' })
  const dayMonth = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })
  if (a.getFullYear() === b.getFullYear()) {
    const end2 = dateLong.format(b)
    if (a.getMonth() === b.getMonth()) {
      // mismo mes y año: "18 al 20 de mayo de 2026"
      return `${day.format(a)} al ${end2}`
    }
    // mismo año: "18 de mayo al 12 de agosto de 2026"
    return `${dayMonth.format(a)} al ${end2}`
  }
  return `${formatDate(start)} al ${formatDate(end)}`
}

/** Timestamp de la API → valor de un <input type="datetime-local"> en hora de la liga. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const p = Object.fromEntries(
    localParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]),
  )
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}

/** Valor de un <input type="datetime-local"> (hora de la liga) → ISO UTC para la API. */
export function fromDateTimeLocal(value: string | null | undefined): string | null {
  if (!value) return null
  return new Date(`${value}:00${LEAGUE_OFFSET}`).toISOString()
}

export function formatTime(iso: string | null): string {
  if (!iso) return ''
  return time.format(new Date(iso))
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return 'Por definir'
  return dateTime.format(new Date(iso)).replace(', ', ' · ')
}

/** Iniciales para el escudo cuando no hay logo. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
