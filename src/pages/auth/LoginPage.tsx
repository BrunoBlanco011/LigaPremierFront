import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { supabaseConfigured } from '@/lib/supabase'
import { FormField } from '@/components/molecules/FormField'
import { PasswordField } from '@/components/molecules/PasswordField'
import { Button } from '@/components/atoms/Button'
import { Alert } from '@/components/molecules/Alert'

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
    <div className="login2 sobre-verde">
      <section className="cancha login2__aside">
        <div className="yardas" aria-hidden="true" style={{ fontSize: 72 }}>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
        </div>
        <Link to="/" className="login2__back">
          ← Volver al sitio
        </Link>
        <div className="login2__brand">
          <img src="/logo.png" alt="" className="login2__logo" />
          <h2 style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <span className="ital login2__brandline">Liga</span>
            <span className="ital login2__brandline">Premier</span>
            <span className="ital login2__brandsub">Football Flag Chiapas A.C.</span>
          </h2>
        </div>
        <p className="login2__tagline">
          Rol de juegos, resultados y tabla de posiciones de la liga, al día después de cada jornada.
        </p>
      </section>

      <main className="login2__main">
        <form className="login2__form" onSubmit={onSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="login2__eyebrow">ACCESO PARA ADMINISTRADORES Y COACHES</span>
            <h1 className="ital login2__title">Iniciar sesión</h1>
          </div>

          {!supabaseConfigured && (
            <Alert tone="warning">
              Falta configurar Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).
            </Alert>
          )}
          {serverError && <Alert tone="danger">{serverError}</Alert>}

          <FormField
            label="Correo electrónico"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="tucorreo@liga.mx"
            error={errors.email?.message}
            {...register('email', { required: 'Ingresa tu correo' })}
          />
          <PasswordField
            label="Contraseña"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Ingresa tu contraseña' })}
          />
          <Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>
          <p className="login2__hint">
            ¿Olvidaste tu contraseña? Pídele al administrador de la liga que la restablezca.
          </p>
        </form>
      </main>
    </div>
  )
}
