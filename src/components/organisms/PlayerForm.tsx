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
import { Button } from '@/components/atoms/Button'

interface FormValues {
  full_name: string
  jersey_number: string
}

/** Alta y edición de jugador (RF-41). */
export function PlayerForm({
  teamId,
  player,
  onClose,
}: {
  teamId: string
  player?: Player
  onClose: () => void
}) {
  const isEdit = Boolean(player)
  const create = useCreatePlayer(teamId)
  const update = useUpdatePlayer(teamId)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: player?.full_name ?? '',
      jersey_number: player?.jersey_number != null ? String(player.jersey_number) : '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input: PlayerInput = {
      full_name: values.full_name.trim(),
      jersey_number:
        values.jersey_number.trim() === '' ? null : Number(values.jersey_number),
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
      }
      setFormError(friendlyMessage(err))
    }
  })

  return (
    <Modal title={isEdit ? 'Editar jugador' : 'Nuevo jugador'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}

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
