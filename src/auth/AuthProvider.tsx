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

    async function init() {
      await loadMe()
      if (active) setLoading(false)
    }
    init()

    // RF-04: reaccionar a cambios de sesión (login, logout, refresh de token).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        queryClient.clear()
      } else {
        loadMe()
      }
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
