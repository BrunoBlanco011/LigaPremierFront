import { friendlyMessage } from './errors'

/** Muestra el error de una mutación como alerta (patrón común en acciones admin).
 *  La confirmación destructiva vive en ConfirmDialog (useConfirm/useConfirmMutate). */
export function alertOnError(error: unknown) {
  window.alert(friendlyMessage(error))
}
