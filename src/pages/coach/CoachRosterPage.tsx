import { useParams } from 'react-router-dom'
import { useClub } from '@/features/clubs/queries'
import { RosterManager } from '@/components/organisms/RosterManager'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

/** Plantilla del club (RF-41): lectura + alta/edición/baja/eliminación. */
export function CoachRosterPage() {
  const { id = '' } = useParams()
  const club = useClub(id)

  if (club.isLoading) return <LoadingState />
  if (club.isError || !club.data)
    return <ErrorState error={club.error} onRetry={() => club.refetch()} />

  return (
    <>
      <p className="eyebrow">Mi club</p>
      <h1 className="page__title" style={{ fontSize: 28, marginBottom: 20 }}>
        {club.data.name}
      </h1>
      <RosterManager clubId={id} />
    </>
  )
}
