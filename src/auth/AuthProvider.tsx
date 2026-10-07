import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types/api'
import { AuthContext } from './authContext'
import type { AuthState } from './authContext'

/** Cierre de sesión automático tras este tiempo sin actividad (panel con datos privados). */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const

interface LoginResponse {
  access_token: string
  refresh_token: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // RF-02: identificar al usuario y su rol.
  const loadMe = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setUser(null)
      return null
    }
    try {
      const me = await api.get<User>('/me')
      setUser(me)
      return me
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let active = true

    // RF-04: una sola fuente de verdad. onAuthStateChange emite INITIAL_SESSION
    // al montar, así que no hace falta un init() aparte (evita el /me duplicado).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      // El refresh de token no cambia el usuario: no re-consultamos /me.
      if (event === 'TOKEN_REFRESHED') return

      if (!session) {
        setUser(null)
        // Solo al cerrar sesión: en INITIAL_SESSION (visitante sin sesión) limpiar la
        // caché cancelaba las consultas públicas en curso y la página quedaba en "Cargando…".
        if (event === 'SIGNED_OUT') queryClient.clear()
        setLoading(false)
        return
      }

      // Diferido: no se debe llamar a supabase dentro del propio callback.
      setTimeout(() => {
        if (!active) return
        loadMe().finally(() => {
          if (active) setLoading(false)
        })
      }, 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadMe])

  // RF-01: iniciar sesión. Pasa por la API (no directo a Supabase) para que aplique
  // el bloqueo por intentos fallidos y quede en la bitácora de auditoría.
  const signIn = useCallback(
    async (email: string, password: string): Promise<User> => {
      const tokens = await api.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { auth: false },
      )
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      })
      if (error) throw error
      const me = await loadMe()
      if (!me) throw new Error('No se pudo obtener el perfil del usuario.')
      return me
    },
    [loadMe],
  )

  // RF-03: cerrar sesión.
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    queryClient.clear()
  }, [])

  // Cierre por inactividad: si nadie toca la página en IDLE_TIMEOUT_MS se cierra la sesión.
  useEffect(() => {
    if (!user) return
    let timer = window.setTimeout(() => void signOut(), IDLE_TIMEOUT_MS)
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => void signOut(), IDLE_TIMEOUT_MS)
    }
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [user, signOut])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
