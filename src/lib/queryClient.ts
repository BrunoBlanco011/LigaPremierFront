import { MutationCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from './errors'
import { toast } from './toast'

// Mensajes de feedback por mutación, declarados en el `meta` de cada hook.
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Toast de éxito al completar la mutación. */
      successMessage?: string
    }
  }
}

export const queryClient = new QueryClient({
  // Feedback de éxito global y consistente: cuando un hook define
  // `successMessage`, se muestra un toast al completar. Los errores se muestran
  // en línea (formularios) o vía toast en acciones de ícono (ver alertOnError).
  mutationCache: new MutationCache({
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const msg = mutation.meta?.successMessage
      if (msg) toast.success(msg)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // No reintentar errores de cliente (4xx); sí fallos de red.
        if (error instanceof ApiError && error.status < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})
