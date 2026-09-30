import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Tournament, TournamentStatus } from '@/types/api'
import {
  useCreateTournament,
  useUpdateTournament,
  type TournamentInput,
} from '@/features/tournaments/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
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
  season: string
  category: string
  start_date: string
  end_date: string
  status: TournamentStatus
  points_win: number
  points_loss: number
}

/** Alta y edición de torneo (RF-20). */
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
      season: tournament?.season ?? '',
      category: tournament?.category ?? '',
      start_date: tournament?.start_date ?? '',
      end_date: tournament?.end_date ?? '',
      status: tournament?.status ?? 'draft',
      points_win: tournament?.points_win ?? 2,
      points_loss: tournament?.points_loss ?? 0,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const payload: TournamentInput = {
      name: values.name.trim(),
      season: values.season.trim() || null,
      category: values.category.trim() || null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      status: values.status,
      points_win: Number(values.points_win),
      points_loss: Number(values.points_loss),
    }
    try {
      if (isEdit) await update.mutateAsync(payload)
      else await create.mutateAsync(payload)
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        // 422: marca el campo con error usando loc
        for (const key of ['name', 'start_date', 'end_date'] as const) {
          const msg = err.fieldError(key)
          if (msg) setError(key, { message: msg })
        }
      }
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
          <FormField label="Temporada" placeholder="Apertura 2026" {...register('season')} />
          <FormField label="Categoría" placeholder="Mixta" {...register('category')} />
        </div>

        <div className="form-row">
          <FormField
            label="Inicio"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <FormField
            label="Fin"
            type="date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        <div className="form-row">
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
          <div className="form-row" style={{ gap: 10 }}>
            <FormField
              label="Pts victoria"
              type="number"
              min={0}
              {...register('points_win', { valueAsNumber: true })}
            />
            <FormField
              label="Pts derrota"
              type="number"
              min={0}
              {...register('points_loss', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="flag" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear torneo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
