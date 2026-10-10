// Notificaciones efímeras (toasts) con estilo de marca. Reemplazan window.alert.
// Store a nivel de módulo para poder emitir desde código que no es componente
// (p. ej. el MutationCache de TanStack o helpers), no solo desde hooks.

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

type Listener = (items: ToastItem[]) => void

let items: ToastItem[] = []
const listeners = new Set<Listener>()
let seq = 0

function emit() {
  for (const l of listeners) l(items)
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

/** Agrega un toast; se descarta solo tras `ms` (0 = permanente). */
export function pushToast(tone: ToastTone, message: string, ms = 4500): number {
  const id = ++seq
  items = [...items, { id, tone, message }]
  emit()
  if (ms > 0) setTimeout(() => dismissToast(id), ms)
  return id
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener(items)
  return () => {
    listeners.delete(listener)
  }
}

export const toast = {
  success: (message: string) => pushToast('success', message),
  error: (message: string) => pushToast('error', message, 6000),
  info: (message: string) => pushToast('info', message),
}
