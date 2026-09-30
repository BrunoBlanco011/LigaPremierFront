import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './errors'

/**
 * Mapea los errores de validación 422 de la API a los campos del formulario
 * usando `loc`. Marca cada campo indicado que tenga un mensaje de error.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
) {
  if (!(err instanceof ApiError) || !err.issues) return
  for (const field of fields) {
    const msg = err.fieldError(field as string)
    if (msg) setError(field, { message: msg })
  }
}
