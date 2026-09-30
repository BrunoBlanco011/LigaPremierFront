import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types/api'
import { AuthContext } from './authContext'
import type { AuthState } from './authContext'

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
        queryClient.clear()
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

  // RF-01: iniciar sesión.
  const signIn = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
