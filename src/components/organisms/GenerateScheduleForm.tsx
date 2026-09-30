import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useGenerateSchedule,
  type GenerateScheduleInput,
} from '@/features/schedule/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/atoms/Button'

interface FormValues {
  start_date: string
  days_between_rounds: number
  double_round: boolean
}

/** Generar rol de juegos automático (RF-23). */
export function GenerateScheduleForm({
  tournamentId,
  onClose,
}: {
  tournamentId: string
  onClose: () => void
}) {
  const generate = useGenerateSchedule(tournamentId)
  const [formError, setFormError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { start_date: '', days_between_rounds: 7, double_round: false },
  })

  const run = (values: FormValues, replace: boolean) => {
    setFormError(null)
    const input: GenerateScheduleInput = {
      start_date: values.start_date || null,
      days_between_rounds: Number(values.days_between_rounds),
      double_round: values.double_round,
      replace_existing: replace,
    }
    generate.mutate(input, {
      onSuccess: onClose,
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          setConflict(true)
          setFormError(
            'El torneo ya tiene rol de juegos. Puedes reemplazarlo (se perderán jornadas y partidos actuales).',
          )
        } else {
          setFormError(friendlyMessage(err))
        }
      },
    })
  }

  const onSubmit = handleSubmit((values) => run(values, false))
  const onReplace = handleSubmit((values) => run(values, true))

  return (
    <Modal title="Generar rol de juegos" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 16 }}>
          Todos contra todos. Con equipos impares, uno descansa por jornada.
        </p>
        <FormField label="Fecha de la jornada 1" type="date" {...register('start_date')} />
        <FormField
          label="Días entre jornadas"
          type="number"
          min={1}
          {...register('days_between_rounds', { valueAsNumber: true })}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, margin: '8px 0' }}>
          <input type="checkbox" {...register('double_round')} />
          Ida y vuelta (doble round)
        </label>

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {conflict ? (
            <Button
              type="button"
              variant="danger"
              onClick={onReplace}
              disabled={generate.isPending}
            >
              {generate.isPending ? 'Reemplazando…' : 'Reemplazar rol existente'}
            </Button>
          ) : (
            <Button type="submit" variant="flag" disabled={generate.isPending}>
              {generate.isPending ? 'Generando…' : 'Generar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}
