import { createContext } from 'react'
import type { User } from '@/types/api'

export interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
