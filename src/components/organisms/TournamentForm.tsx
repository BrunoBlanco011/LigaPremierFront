import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Tournament, TournamentStatus } from '@/types/api'
import {
  useCreateTournament,
  useUpdateTournament,
  type TournamentInput,
} from '@/features/tournaments/mutations'
import { friendlyMessage } from '@/lib/errors'
import { applyApiFieldErrors } from '@/lib/formErrors'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'En curso' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
]

interface FormValues {
  name: string
  category: string
  start_date: string
  status: TournamentStatus
}

/**
 * Alta y edición de torneo (RF-20).
 * La fecha de fin la marca el rol de juegos (depende de los equipos inscritos)
 * y los puntos son fijos: 2 por victoria, 0 por derrota.
 */
export function TournamentForm({
  tournament,
  onClose,
}: {
  tournament?: Tournament
  onClose: () => void
}) {
  const isEdit = Boolean(tournament)
  const create = useCreateTournament()
  const update = useUpdateTournament(tournament?.id ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: tournament?.name ?? '',
      category: tournament?.category ?? '',
      start_date: tournament?.start_date ?? '',
      status: tournament?.status ?? 'draft',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const payload: TournamentInput = {
      name: values.name.trim(),
      category: values.category.trim() || null,
      start_date: values.start_date || null,
      status: values.status,
    }
    try {
      if (isEdit) await update.mutateAsync(payload)
      else await create.mutateAsync(payload)
      onClose()
    } catch (err) {
      // 422: marca cada campo del formulario con error usando loc.
      applyApiFieldErrors(err, setError, ['name', 'category', 'start_date', 'status'])
      setFormError(friendlyMessage(err))
    }
  })

  return (
    <Modal title={isEdit ? 'Editar torneo' : 'Nuevo torneo'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}

        <FormField
          label="Nombre"
          required
          maxLength={120}
          error={errors.name?.message}
          {...register('name', { required: 'El nombre es obligatorio' })}
        />

        <div className="form-row">
          <FormField label="Categoría" placeholder="Mixta" {...register('category')} />
          <FormField
            label="Inicio"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
        </div>

        <div className="field">
          <Label htmlFor="status">Estado</Label>
          <Select id="status" {...register('status')}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear torneo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
