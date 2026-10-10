import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Club } from '@/types/api'
import {
  useCreateClub,
  useUpdateClub,
  type ClubInput,
} from '@/features/clubs/mutations'
import { useCoaches } from '@/features/users/queries'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { applyApiFieldErrors } from '@/lib/formErrors'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'

interface FormValues {
  name: string
  coach_name: string
  coach_user_id: string
}

/** Alta y edición de club (RF-21). Con `hideCoachAssignment`, el coach edita
 *  su propio club sin el selector de coach (que es admin-only). */
export function ClubForm({
  club,
  onClose,
  hideCoachAssignment = false,
}: {
  club?: Club
  onClose: () => void
  hideCoachAssignment?: boolean
}) {
  const isEdit = Boolean(club)
  const create = useCreateClub()
  const update = useUpdateClub(club?.id ?? '')
  const coaches = useCoaches(!hideCoachAssignment)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: club?.name ?? '',
      coach_name: club?.coach_name ?? '',
      coach_user_id: club?.coach_user_id ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input: ClubInput = {
      name: values.name.trim(),
      coach_name: values.coach_name.trim() || null,
      // Solo el admin asigna el coach; omitirlo evita un 403 al editar como coach.
      ...(hideCoachAssignment ? {} : { coach_user_id: values.coach_user_id || null }),
    }
    try {
      if (isEdit && club) await update.mutateAsync(input)
      else await create.mutateAsync(input)
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('name', { message: 'Ya existe un club con ese nombre.' })
      }
      applyApiFieldErrors(err, setError, ['name', 'coach_name', 'coach_user_id'])
      setFormError(friendlyMessage(err))
    }
  })

  return (
    <Modal title={isEdit ? 'Editar club' : 'Nuevo club'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}

        <FormField
          label="Nombre del club"
          required
          error={errors.name?.message}
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        <FormField
          label="Entrenador (para mostrar)"
          placeholder="Nombre del entrenador"
          {...register('coach_name')}
        />
        {!hideCoachAssignment && (
          <div className="field">
            <Label htmlFor="coach_user_id">Cuenta de coach (administra la plantilla)</Label>
            <Select id="coach_user_id" {...register('coach_user_id')}>
              <option value="">Sin asignar</option>
              {coaches.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name ?? c.email}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear club'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
