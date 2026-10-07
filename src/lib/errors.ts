// Normaliza los errores de la API (RF §2.1).

export interface ValidationIssue {
  loc: (string | number)[]
  msg: string
  type?: string
}

export class ApiError extends Error {
  status: number
  /** Texto listo para mostrar (regla de negocio) o null si es lista de validación. */
  detailText: string | null
  /** Errores de formato por campo (422), o null. */
  issues: ValidationIssue[] | null
  /** Segundos de espera que indica el servidor en un 429 (cabecera Retry-After). */
  retryAfter: number | null

  constructor(status: number, detail: unknown, retryAfter: number | null = null) {
    const { text, issues } = parseDetail(detail)
    super(text ?? `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detailText = text
    this.issues = issues
    this.retryAfter = retryAfter
  }

  /** Mensaje de un campo concreto del formulario (para 422 con lista). */
  fieldError(field: string): string | undefined {
    return this.issues?.find((i) => i.loc.includes(field))?.msg
  }
}

function parseDetail(detail: unknown): {
  text: string | null
  issues: ValidationIssue[] | null
} {
  if (typeof detail === 'string') return { text: detail, issues: null }
  if (Array.isArray(detail)) {
    return { text: null, issues: detail as ValidationIssue[] }
  }
  if (detail && typeof detail === 'object' && 'detail' in detail) {
    return parseDetail((detail as { detail: unknown }).detail)
  }
  return { text: null, issues: null }
}

/** Mensaje amigable por código de estado, para mostrar cuando no hay detail. */
export function friendlyMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return tooManyRequestsMessage(err.retryAfter)
    // Un 500 nunca muestra el texto del servidor
    if (err.detailText && err.status < 500) return err.detailText
    switch (err.status) {
      case 401:
        return 'Tu sesión expiró. Inicia sesión de nuevo.'
      case 403:
        return 'No tienes permiso para esta acción.'
      case 404:
        return 'No encontramos lo que buscas.'
      case 409:
        return 'Ya existe un registro con esos datos.'
      case 413:
        return 'El archivo o los datos enviados son demasiado grandes.'
      case 422:
        return 'Revisa los datos del formulario.'
      default:
        return 'Algo salió mal. Inténtalo de nuevo.'
    }
  }
  return 'No pudimos conectar con el servidor.'
}

/** Texto para un 429: cuánto falta para poder intentar de nuevo. */
export function tooManyRequestsMessage(retryAfter: number | null): string {
  if (!retryAfter) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (retryAfter < 60) return `Demasiados intentos. Inténtalo de nuevo en ${retryAfter} segundos.`
  const minutes = Math.ceil(retryAfter / 60)
  return `Demasiados intentos. Inténtalo de nuevo en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`
}
