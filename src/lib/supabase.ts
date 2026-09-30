import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // No detenemos la app: el sitio público funciona sin sesión.
  // El login mostrará un aviso si falta configuración.
  console.warn(
    '[LigaPremier] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local',
  )
}

export const supabaseConfigured = Boolean(url && anonKey)

// Cliente tolerante a configuración ausente (placeholder inofensivo).
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'public-anon-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
)
