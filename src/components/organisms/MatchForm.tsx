import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Match, MatchStatus } from '@/types/api'
import {
  useCreateMatch,
  useUpdateMatch,
  type MatchInput,
} from '@/features/matches/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { useRounds } from '@/features/schedule/queries'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'
import { toDateTimeLocal, fromDateTimeLocal } from '@/lib/format'

const STATUS: { value: MatchStatus; label: string }[] = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'postponed', label: 'Pendiente / reprogramado' },
  { value: 'cancelled', label: 'Cancelado' },
]

interface FormValues {
  home_team_id: string
  away_team_id: string
  round_id: string
  scheduled_at: string
  venue: string
  status: MatchStatus
  notes: string
}

/** Alta y edición de partido (RF-25). */
export function MatchForm({
  tournamentId,
  match,
  onClose,
}: {
  tournamentId: string
  match?: Match
  onClose: () => void
}) {
  const isEdit = Boolean(match)
  const teams = useTournamentTeams(tournamentId)
  const rounds = useRounds(tournamentId)
  const create = useCreateMatch(tournamentId)
  const update = useUpdateMatch(tournamentId)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      home_team_id: match?.home_team_id ?? '',
      away_team_id: match?.away_team_id ?? '',
      round_id: match?.round_id ?? '',
      scheduled_at: toDateTimeLocal(match?.scheduled_at),
      venue: match?.venue ?? '',
      status: (match?.status as MatchStatus) ?? 'scheduled',
      notes: match?.notes ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    if (values.home_team_id === values.away_team_id) {
      setError('away_team_id', { message: 'Los equipos deben ser distintos.' })
      return
    }
    const input: MatchInput = {
      home_team_id: values.home_team_id,
      away_team_id: values.away_team_id,
      round_id: values.round_id || null,
      scheduled_at: fromDateTimeLocal(values.scheduled_at),
      venue: values.venue.trim() || null,
      status: values.status,
      notes: values.notes.trim() || null,
    }
    try {
      if (isEdit && match) await update.mutateAsync({ id: match.id, input })
      else await create.mutateAsync(input)
      onClose()
    } catch (err) {
      setFormError(err instanceof ApiError ? friendlyMessage(err) : friendlyMessage(err))
    }
  })

  return (
    <Modal title={isEdit ? 'Editar partido' : 'Nuevo partido'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}

        <div className="form-row">
          <div className="field">
            <Label htmlFor="home_team_id" required>Local</Label>
            <Select id="home_team_id" {...register('home_team_id', { required: true })}>
              <option value="">Selecciona…</option>
              {teams.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <div className="field">
            <Label htmlFor="away_team_id" required>Visitante</Label>
            <Select id="away_team_id" hasError={Boolean(errors.away_team_id)} {...register('away_team_id', { required: true })}>
              <option value="">Selecciona…</option>
              {teams.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            {errors.away_team_id && <p className="field__error">{errors.away_team_id.message}</p>}
          </div>
        </div>

        <div className="field">
          <Label htmlFor="round_id">Jornada</Label>
          <Select id="round_id" {...register('round_id')}>
            <option value="">Sin jornada</option>
            {rounds.data?.map((r) => (
              <option key={r.id} value={r.id}>{r.name ?? `Jornada ${r.number}`}</option>
            ))}
          </Select>
        </div>

        <div className="form-row">
          <FormField label="Fecha y hora" type="datetime-local" {...register('scheduled_at')} />
          <FormField label="Sede" placeholder="Cancha 1" {...register('venue')} />
        </div>

        <div className="field">
          <Label htmlFor="status">Estado</Label>
          <Select id="status" {...register('status')}>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
        <FormField label="Notas" placeholder="Ej. Se canceló por lluvia" {...register('notes')} />

        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="flag" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear partido'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
