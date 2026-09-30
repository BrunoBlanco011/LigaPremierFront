import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { supabaseConfigured } from '@/lib/supabase'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/atoms/Button'

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null)
    try {
      const user = await signIn(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/coach', { replace: true })
    } catch (err) {
      setServerError(
        err instanceof Error && err.message
          ? 'Correo o contraseña incorrectos.'
          : 'No pudimos iniciar sesión. Inténtalo de nuevo.',
      )
    }
  })

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="brand__mark" style={{ width: 44, height: 44 }}>
            <Shield size={24} />
          </span>
        </div>
        <h1 className="login-card__title">Iniciar sesión</h1>
        <p className="login-card__sub">Panel de administración de LigaPremier</p>

        {!supabaseConfigured && (
          <div className="login-card__error">
            Falta configurar Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).
          </div>
        )}
        {serverError && <div className="login-card__error">{serverError}</div>}

        <form onSubmit={onSubmit} noValidate>
          <FormField
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@liga.mx"
            error={errors.email?.message}
            {...register('email', { required: 'Ingresa tu correo' })}
          />
          <FormField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Ingresa tu contraseña' })}
          />
          <Button type="submit" variant="flag" block disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--ink-soft)' }}>
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </div>
  )
}
