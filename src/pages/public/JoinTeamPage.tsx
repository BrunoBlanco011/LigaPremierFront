import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useInvite } from '@/features/invites/queries'
import { useRedeemInvite, type SelfRegisterInput } from '@/features/invites/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { SkewTag } from '@/components/atoms/SkewTag'
import { JerseyPreview } from '@/components/molecules/JerseyPreview'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/atoms/Button'
import { Alert } from '@/components/molecules/Alert'
import { FootballSpinner } from '@/components/atoms/FootballSpinner'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatDateTime } from '@/lib/format'

interface FormValues {
  full_name: string
  jersey_number: string
}

export function JoinTeamPage() {
  const { token = '' } = useParams()
  const invite = useInvite(token)
  const redeem = useRedeemInvite(token)
  const [done, setDone] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [jersey, setJersey] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const jerseyReg = register('jersey_number', {
    min: { value: 0, message: 'Entre 0 y 999' },
    max: { value: 999, message: 'Entre 0 y 999' },
  })

  usePageTitle(invite.data ? `Únete a ${invite.data.club.name}` : 'Unirse')

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input: SelfRegisterInput = {
      full_name: values.full_name.trim(),
      jersey_number: values.jersey_number.trim() === '' ? null : Number(values.jersey_number),
    }
    try {
      await redeem.mutateAsync(input)
      setDone(values.full_name.trim())
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('jersey_number', { message: 'Ese número ya lo usa otro jugador activo.' })
      }
      setFormError(friendlyMessage(err))
    }
  })

  if (invite.isLoading) {
    return (
      <div className="join2">
        <div className="join2__state">
          <FootballSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (invite.isError || !invite.data) {
    return (
      <div className="join2">
        <div className="join2__state">
          <h1 className="ital" style={{ fontSize: 40, lineHeight: 1 }}>Link no válido</h1>
          <p className="join2__hint" style={{ marginTop: 10 }}>
            Esta invitación no existe o ya expiró. Pídele a tu coach un link nuevo.
          </p>
          <Link to="/" className="btn btn--secondary" style={{ marginTop: 20 }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  const club = invite.data.club

  if (done) {
    return (
      <div className="join2">
        <section className="cancha join2__band sobre-verde">
          <img src="/logo.png" alt="" className="join2__logo" />
          <SkewTag>¡Bienvenido!</SkewTag>
          <h1 className="ital join2__title">¡Listo, {done}!</h1>
        </section>
        <div className="join2__card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <CheckCircle2 size={44} color="var(--color-premier)" className="enter-up" />
          <p className="join2__hint enter-fade" style={{ animationDelay: '0.12s' }}>
            Quedaste registrado en <strong>{club.name}</strong>. Tu coach ya te verá en el roster.
          </p>
          <Link
            to="/"
            className="btn btn--primary btn--block enter-fade"
            style={{ animationDelay: '0.18s' }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="join2">
      <section className="cancha join2__band sobre-verde">
        <img src="/logo.png" alt="Liga Premier Football Flag Chiapas" className="join2__logo" />
        <SkewTag>Invitación de tu coach</SkewTag>
        <h1 className="ital join2__title">Únete a {club.name}</h1>
      </section>

      <form className="join2__card" onSubmit={onSubmit} noValidate>
        <div className="join2__jersey">
          <div className="join2__jersey-box">
            <JerseyPreview number={jersey} error={Boolean(errors.jersey_number)} size={112} />
          </div>
          <p className="join2__hint">
            Así se verá tu número en la plantilla. Si ya tienes uno con el equipo, usa el mismo.
          </p>
        </div>

        {formError && <Alert tone="danger">{formError}</Alert>}

        <FormField
          label="Nombre completo"
          autoComplete="name"
          required
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Escribe tu nombre' })}
        />
        <FormField
          label="Número de jersey (opcional)"
          type="number"
          min={0}
          max={999}
          inputMode="numeric"
          placeholder="Opcional"
          error={errors.jersey_number?.message}
          {...jerseyReg}
          onChange={(e) => {
            void jerseyReg.onChange(e)
            setJersey(e.target.value)
          }}
        />
        <Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
          {isSubmitting ? 'Registrando…' : `Unirme a ${club.name}`}
        </Button>
        <p className="join2__expiry">Este link vence el {formatDateTime(invite.data.expires_at)}</p>
      </form>
    </div>
  )
}
