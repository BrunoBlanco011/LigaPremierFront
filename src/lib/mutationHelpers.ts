import type { UseMutationResult } from '@tanstack/react-query'
import { friendlyMessage } from './errors'

/** Muestra el error de una mutación como alerta (patrón común en acciones admin). */
export function alertOnError(error: unknown) {
  window.alert(friendlyMessage(error))
}

/** Confirma con el usuario y, si acepta, ejecuta la mutación mostrando errores. */
export function confirmAndMutate<TData, TError, TVars>(
  message: string,
  mutation: UseMutationResult<TData, TError, TVars, unknown>,
  variables: TVars,
) {
  if (window.confirm(message)) {
    mutation.mutate(variables, { onError: alertOnError })
  }
}
