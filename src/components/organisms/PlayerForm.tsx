import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Player } from '@/types/api'
import {
  useCreatePlayer,
  useUpdatePlayer,
  type PlayerInput,
} from '@/features/players/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { JerseyPreview } from '@/components/molecules/JerseyPreview'
import { Button } from '@/components/atoms/Button'

interface FormValues {
  full_name: string
  jersey_number: string
  birth_date: string
}

/** Alta y edición de jugador (RF-41). La plantilla es del club. */
export function PlayerForm({
  clubId,
  player,
  onClose,
}: {
  clubId: string
  player?: Player
  onClose: () => void
}) {
  const isEdit = Boolean(player)
  const create = useCreatePlayer(clubId)
  const update = useUpdatePlayer(clubId)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: player?.full_name ?? '',
      jersey_number: player?.jersey_number != null ? String(player.jersey_number) : '',
      birth_date: player?.birth_date ?? '',
    },
  })

  const jersey = watch('jersey_number')
  // Fecha local (no UTC) para que el límite no se adelante un día por la noche
  const today = new Date().toLocaleDateString('en-CA')

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input: PlayerInput = {
      full_name: values.full_name.trim(),
      jersey_number:
        values.jersey_number.trim() === '' ? null : Number(values.jersey_number),
      birth_date: values.birth_date || null,
    }
    try {
      if (isEdit && player) await update.mutateAsync({ id: player.id, input })
      else await create.mutateAsync(input)
      onClose()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError('jersey_number', {
            message: 'Ese número ya lo usa otro jugador activo.',
          })
        }
        const msg = err.fieldError('jersey_number')
        if (msg) setError('jersey_number', { message: msg })
        const dateMsg = err.fieldError('birth_date')
        if (dateMsg) setError('birth_date', { message: dateMsg })
      }
      setFormError(friendlyMessage(err))
    }
  })

  return (
    <Modal title={isEdit ? 'Editar jugador' : 'Nuevo jugador'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}

        <div className="join2__jersey" style={{ justifyContent: 'center', marginBottom: 16 }}>
          <div className="join2__jersey-box">
            <JerseyPreview number={jersey} error={Boolean(errors.jersey_number)} size={96} />
          </div>
        </div>

        <FormField
          label="Nombre del jugador"
          required
          error={errors.full_name?.message}
          {...register('full_name', { required: 'El nombre es obligatorio' })}
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
        <FormField
          label="Fecha de nacimiento (opcional)"
          type="date"
          min="1900-01-01"
          max={today}
          error={errors.birth_date?.message}
          {...register('birth_date', {
            validate: (v) =>
              !v || (v >= '1900-01-01' && v <= today) || 'No puede ser una fecha futura',
          })}
        />

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="flag" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
