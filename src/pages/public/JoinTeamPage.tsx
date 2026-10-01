import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useInvite } from '@/features/invites/queries'
import { useRedeemInvite, type SelfRegisterInput } from '@/features/invites/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'

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

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

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

  return (
    <div className="login-wrap">
      <div className="login-card">
        {invite.isLoading ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
            <Spinner />
          </div>
        ) : invite.isError || !invite.data ? (
          <>
            <h1 className="login-card__title">Link no válido</h1>
            <p className="login-card__sub">
              Esta invitación no existe o ya expiró. Pídele a tu coach un link nuevo.
            </p>
            <p style={{ textAlign: 'center', marginTop: 12 }}>
              <Link to="/" style={{ color: 'var(--ink-soft)' }}>← Ir al inicio</Link>
            </p>
          </>
        ) : done ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={44} color="var(--field)" style={{ margin: '0 auto 12px' }} />
            <h1 className="login-card__title">¡Listo, {done}!</h1>
            <p className="login-card__sub">
              Quedaste registrado en <strong>{invite.data.club.name}</strong>. Tu coach ya te verá en el roster.
            </p>
            <Link to="/" className="btn btn--outline" style={{ marginTop: 8 }}>Ir al inicio</Link>
          </div>
        ) : (
          <>
            <div className="login-card__brand">
              <TeamBadge name={invite.data.club.name} logoUrl={invite.data.club.logo_url} showName={false} size={48} />
            </div>
            <h1 className="login-card__title">Únete a {invite.data.club.name}</h1>
            <p className="login-card__sub">Regístrate en la plantilla del club.</p>

            {formError && <div className="login-card__error">{formError}</div>}

            <form onSubmit={onSubmit} noValidate>
              <FormField
                label="Tu nombre completo"
                required
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Escribe tu nombre' })}
              />
              <FormField
                label="Número de jersey"
                type="number"
                min={0}
                max={999}
                placeholder="Opcional"
                error={errors.jersey_number?.message}
                {...register('jersey_number', {
                  min: { value: 0, message: 'Entre 0 y 999' },
                  max: { value: 999, message: 'Entre 0 y 999' },
                })}
              />
              <Button type="submit" variant="flag" block disabled={isSubmitting}>
                {isSubmitting ? 'Registrando…' : 'Unirme al club'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
