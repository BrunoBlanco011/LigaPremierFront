import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
  weekdays: string[]
  start_time: string
  match_duration_minutes: number
  max_matches_per_day: string
  venue: string
  double_round: boolean
}

// El backend usa 0 = lunes … 6 = domingo
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

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

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      start_date: '',
      weekdays: [],
      start_time: '',
      match_duration_minutes: 60,
      max_matches_per_day: '',
      venue: '',
      double_round: false,
    },
  })
  const hasStartDate = Boolean(useWatch({ control, name: 'start_date' }))

  const run = (values: FormValues, replace: boolean) => {
    setFormError(null)
    const input: GenerateScheduleInput = {
      start_date: values.start_date || null,
      weekdays: values.start_date ? values.weekdays.map(Number) : [],
      start_time: (values.start_date && values.start_time) || null,
      match_duration_minutes: Number(values.match_duration_minutes) || 60,
      max_matches_per_day: Number(values.max_matches_per_day) || null,
      venue: values.venue.trim() || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
          Todos contra todos. Con equipos impares, uno descansa por jornada. Los partidos
          de cada jornada se juegan uno tras otro a partir de la hora indicada.
        </p>
        <FormField label="A partir del" type="date" {...register('start_date')} />

        <fieldset className="field" disabled={!hasStartDate} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label" style={{ marginBottom: 6 }}>Días de juego</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {WEEKDAYS.map((day, i) => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                <input type="checkbox" value={i} {...register('weekdays')} />
                {day}
              </label>
            ))}
          </div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 6 }}>
            {hasStartDate
              ? 'Cada jornada empieza en el siguiente día de juego libre. Sin marcar: el mismo día de la semana que la fecha de inicio.'
              : 'Elige primero la fecha de inicio para programar días y horarios.'}
          </p>
        </fieldset>

        <div className="form-row">
          <FormField
            label="Hora del 1er partido"
            type="time"
            disabled={!hasStartDate}
            {...register('start_time')}
          />
          <FormField
            label="Duración por partido (min)"
            type="number"
            min={10}
            max={300}
            {...register('match_duration_minutes', { valueAsNumber: true })}
          />
        </div>
        <div className="form-row">
          <FormField
            label="Máx. partidos por día"
            type="number"
            min={1}
            placeholder="Sin límite"
            disabled={!hasStartDate}
            {...register('max_matches_per_day')}
          />
          <FormField label="Sede" placeholder="Campo Norte" maxLength={120} {...register('venue')} />
        </div>
        {hasStartDate && (
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: -4, marginBottom: 12 }}>
            Si una jornada tiene más partidos que el máximo, continúa el siguiente día de juego
            (p. ej. 6 partidos, máx. 3, lunes y miércoles: 3 el lunes y 3 el miércoles).
          </p>
        )}
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
