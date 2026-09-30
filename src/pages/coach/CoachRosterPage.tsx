import { useParams } from 'react-router-dom'
import { useTeam } from '@/features/teams/queries'
import { RosterManager } from '@/components/organisms/RosterManager'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

/** Roster del coach (RF-41): lectura + alta/edición/baja/eliminación. */
export function CoachRosterPage() {
  const { id = '' } = useParams()
  const team = useTeam(id)

  if (team.isLoading) return <LoadingState />
  if (team.isError || !team.data)
    return <ErrorState error={team.error} onRetry={() => team.refetch()} />

  return (
    <>
      <p className="eyebrow">Mi equipo</p>
      <h1 className="page__title" style={{ fontSize: 28, marginBottom: 20 }}>
        {team.data.name}
      </h1>
      <RosterManager teamId={id} />
    </>
  )
}
