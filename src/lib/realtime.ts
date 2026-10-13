import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BASE } from './api'

/** Canal de avisos del backend: cada escritura exitosa en la API manda un `change`. */
const WS_URL = `${BASE.replace(/^http/, 'ws')}/ws`

// Varias escrituras seguidas (p. ej. capturar estadísticas) se juntan en un solo refresco.
const DEBOUNCE_MS = 300
const MAX_RETRY_MS = 30_000
// Si la compu se suspende o cambia de red, el socket puede quedar "abierto" pero muerto
// sin que el navegador lo note: cada cierto tiempo se manda un ping y, si no contesta, se reconecta.
const PING_EVERY_MS = 25_000
const PONG_TIMEOUT_MS = 10_000

// Apagado si VITE_ENABLE_REALTIME no es "true" (p. ej. contra un backend sin /ws).
const REALTIME_ENABLED = import.meta.env.VITE_ENABLE_REALTIME === 'true'

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
    if (!REALTIME_ENABLED) return
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let refreshTimer: ReturnType<typeof setTimeout> | undefined
    let pingTimer: ReturnType<typeof setInterval> | undefined
    let pongTimer: ReturnType<typeof setTimeout> | undefined
    let retryMs = 1_000
    let connectedBefore = false
    let closed = false

    const refresh = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => queryClient.invalidateQueries(), DEBOUNCE_MS)
    }

    const stopHeartbeat = () => {
      clearInterval(pingTimer)
      clearTimeout(pongTimer)
    }

    // Manda un ping; si en PONG_TIMEOUT_MS no llega nada, la conexión se da por muerta
    const checkAlive = () => {
      if (socket?.readyState !== WebSocket.OPEN) return
      clearTimeout(pongTimer)
      socket.send('ping')
      pongTimer = setTimeout(reconnectNow, PONG_TIMEOUT_MS)
    }

    // Suelta el socket actual sin esperar su cierre (si está muerto, onclose tarda minutos)
    const reconnectNow = () => {
      if (closed) return
      stopHeartbeat()
      clearTimeout(retryTimer)
      if (socket) {
        socket.onmessage = null
        socket.onclose = null
        socket.close()
      }
      connect()
    }

    const connect = () => {
      socket = new WebSocket(WS_URL)

      socket.onmessage = ({ data }) => {
        clearTimeout(pongTimer)
        const msg = JSON.parse(data) as RealtimeMessage
        if (msg.type === 'hello') {
          clearInterval(pingTimer)
          pingTimer = setInterval(checkAlive, PING_EVERY_MS)
          retryMs = 1_000
          // Mientras estuvo desconectado pudo perderse algún aviso
          if (connectedBefore) refresh()
          connectedBefore = true
        } else if (msg.type === 'change') {
          refresh()
        }
      }

      socket.onclose = () => {
        stopHeartbeat()
        if (closed) return
        retryTimer = setTimeout(connect, retryMs)
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS)
      }
    }

    // Al volver a la pestaña o recuperar internet se revisa la conexión de inmediato
    const onResume = () => {
      if (document.visibilityState !== 'visible') return
      if (socket?.readyState === WebSocket.OPEN) checkAlive()
      else if (socket?.readyState !== WebSocket.CONNECTING) reconnectNow()
    }

    connect()
    document.addEventListener('visibilitychange', onResume)
    window.addEventListener('online', onResume)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', onResume)
      window.removeEventListener('online', onResume)
      stopHeartbeat()
      clearTimeout(retryTimer)
      clearTimeout(refreshTimer)
      socket?.close()
    }
  }, [queryClient])
}
