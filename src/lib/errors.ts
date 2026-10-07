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

  constructor(status: number, detail: unknown) {
    const { text, issues } = parseDetail(detail)
    super(text ?? `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detailText = text
    this.issues = issues
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
    if (err.detailText) return err.detailText
    switch (err.status) {
      case 401:
        return 'Tu sesión expiró. Inicia sesión de nuevo.'
      case 403:
        return 'No tienes permiso para esta acción.'
      case 404:
        return 'No encontramos lo que buscas.'
      case 409:
        return 'Ya existe un registro con esos datos.'
      case 422: {
        // Muestra el primer problema de validación para que se sepa qué campo corregir
        const issue = err.issues?.[0]
        const field = issue?.loc.filter((p) => p !== 'body').join('.')
        return issue
          ? `Revisa los datos del formulario (${field ? `${field}: ` : ''}${issue.msg}).`
          : 'Revisa los datos del formulario.'
      }
      default:
        return 'Algo salió mal. Inténtalo de nuevo.'
    }
  }
  return 'No pudimos conectar con el servidor.'
}
