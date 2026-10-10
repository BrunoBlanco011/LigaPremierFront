import { friendlyMessage } from './errors'
import { toast } from './toast'

/** Muestra el error de una mutación como toast de marca (acciones de ícono/menú).
 *  La confirmación destructiva vive en ConfirmDialog (useConfirm/useConfirmMutate). */
export function alertOnError(error: unknown) {
  toast.error(friendlyMessage(error))
}
