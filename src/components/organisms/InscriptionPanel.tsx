import { useMemo, useState } from 'react'
import { UserMinus } from 'lucide-react'
import { useClubs } from '@/features/clubs/queries'
import { useTournamentTeams } from '@/features/teams/queries'
import {
  useEnrollClubs,
  useRemoveEnrollment,
} from '@/features/clubs/mutations'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { alertOnError } from '@/lib/mutationHelpers'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'

/** Inscribir / dar de baja clubes en un torneo (RF-22b). */
export function InscriptionPanel({ tournamentId }: { tournamentId: string }) {
  const clubs = useClubs()
  const teams = useTournamentTeams(tournamentId)
  const enroll = useEnrollClubs(tournamentId)
  const remove = useRemoveEnrollment(tournamentId)
  const confirmMutate = useConfirmMutate()
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const enrolledClubIds = useMemo(
    () => new Set((teams.data ?? []).map((t) => t.club_id)),
    [teams.data],
  )

  const available = (clubs.data ?? []).filter((c) => !enrolledClubIds.has(c.id))

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = () => {
    if (checked.size === 0) return
    enroll.mutate([...checked], {
      onSuccess: () => setChecked(new Set()),
      onError: alertOnError,
    })
  }

  const removeEnrollment = (teamId: string, name: string) =>
    confirmMutate(
      `¿Dar de baja a "${name}" de este torneo?\n\nSe borran en cascada sus ` +
        `partidos, estadísticas y finanzas de este torneo (el club se conserva).`,
      remove,
      teamId,
      { confirmLabel: 'Dar de baja' },
    )

  if (clubs.isLoading || teams.isLoading) return <LoadingState />
  if (clubs.isError) return <ErrorState error={clubs.error} onRetry={() => clubs.refetch()} />
  if (teams.isError) return <ErrorState error={teams.error} onRetry={() => teams.refetch()} />

  return (
    <div className="grid grid--2">
      {/* Inscritos */}
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Inscritos</h3>
        {(teams.data ?? []).length === 0 ? (
          <EmptyState title="Sin clubes inscritos" message="Marca clubes de la derecha e inscríbelos." />
        ) : (
          <div className="card">
            {teams.data!.map((t) => (
              <div
                key={t.id}
                className="tcard__row"
                style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}
              >
                <TeamBadge name={t.name} logoUrl={t.logo_url} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeEnrollment(t.id, t.name)}
                  disabled={remove.isPending}
                  aria-label={`Dar de baja ${t.name}`}
                >
                  <UserMinus size={14} color="var(--loss)" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disponibles */}
      <div>
        <div className="dash__topbar" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 18 }}>Clubes disponibles</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={submit}
            disabled={checked.size === 0 || enroll.isPending}
          >
            Inscribir ({checked.size})
          </Button>
        </div>
        {available.length === 0 ? (
          <EmptyState title="No hay clubes por inscribir" />
        ) : (
          <div className="card">
            {available.map((c) => (
              <label
                key={c.id}
                className="tcard__row"
                style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
              >
                <TeamBadge name={c.name} logoUrl={c.logo_url} />
                <input
                  type="checkbox"
                  checked={checked.has(c.id)}
                  onChange={() => toggle(c.id)}
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
