import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BASE } from './api'

/** Canal de avisos del backend: cada escritura exitosa en la API manda un `change`. */
const WS_URL = `${BASE.replace(/^http/, 'ws')}/ws`

// Varias escrituras seguidas (p. ej. capturar estadísticas) se juntan en un solo refresco.
const DEBOUNCE_MS = 300
const MAX_RETRY_MS = 30_000

interface RealtimeMessage {
  type: 'hello' | 'change' | 'pong'
}

/**
 * Mantiene los datos en pantalla al día: cuando alguien modifica algo, se marcan como viejas
 * todas las consultas y React Query vuelve a pedir solo las que están montadas.
 * El aviso no trae datos; cada quien los vuelve a pedir con sus propios permisos.
 */
export function useRealtimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let refreshTimer: ReturnType<typeof setTimeout> | undefined
    let retryMs = 1_000
    let connectedBefore = false
    let closed = false

    const refresh = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => queryClient.invalidateQueries(), DEBOUNCE_MS)
    }

    const connect = () => {
      socket = new WebSocket(WS_URL)

      socket.onmessage = ({ data }) => {
        const msg = JSON.parse(data) as RealtimeMessage
        if (msg.type === 'hello') {
          retryMs = 1_000
          // Mientras estuvo desconectado pudo perderse algún aviso
          if (connectedBefore) refresh()
          connectedBefore = true
        } else if (msg.type === 'change') {
          refresh()
        }
      }

      socket.onclose = () => {
        if (closed) return
        retryTimer = setTimeout(connect, retryMs)
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS)
      }
    }

    connect()
    return () => {
      closed = true
      clearTimeout(retryTimer)
      clearTimeout(refreshTimer)
      socket?.close()
    }
  }, [queryClient])
}
