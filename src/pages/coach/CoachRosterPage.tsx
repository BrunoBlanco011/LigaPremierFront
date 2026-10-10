import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useClub } from '@/features/clubs/queries'
import { RosterManager } from '@/components/organisms/RosterManager'
import { ClubForm } from '@/components/organisms/ClubForm'
import { LogoUploader } from '@/components/organisms/LogoUploader'
import { InviteButton } from '@/components/organisms/InviteButton'
import { Button } from '@/components/atoms/Button'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'
import { usePageTitle } from '@/lib/usePageTitle'

/** Panel del coach: administra su club (datos, logo, roster) y genera links de alta. */
export function CoachRosterPage() {
  const { id = '' } = useParams()
  const club = useClub(id)
  const [editOpen, setEditOpen] = useState(false)
  usePageTitle(club.data ? `${club.data.name} · Mi club` : null)

  if (club.isLoading) return <LoadingState />
  if (club.isError || !club.data)
    return <ErrorState error={club.error} onRetry={() => club.refetch()} />

  return (
    <>
      <p className="eyebrow">Mi club</p>
      <div className="dash__topbar" style={{ alignItems: 'flex-start' }}>
        <h1 className="page__title" style={{ fontSize: 28 }}>{club.data.name}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={16} /> Editar club
          </Button>
          <InviteButton clubId={id} />
        </div>
      </div>

      <div className="card card--pad" style={{ marginBottom: 20 }}>
        <LogoUploader clubId={id} name={club.data.name} logoUrl={club.data.logo_url} />
      </div>

      <RosterManager clubId={id} />

      {editOpen && (
        <ClubForm
          club={club.data}
          hideCoachAssignment
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
