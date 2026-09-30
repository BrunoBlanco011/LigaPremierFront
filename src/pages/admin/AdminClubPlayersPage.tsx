import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftRight, ChevronLeft } from 'lucide-react'
import type { Player } from '@/types/api'
import { useClub } from '@/features/clubs/queries'
import { RosterManager } from '@/components/organisms/RosterManager'
import { TransferPlayerModal } from '@/components/organisms/TransferPlayerModal'
import { Button } from '@/components/atoms/Button'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

export function AdminClubPlayersPage() {
  const { id = '' } = useParams()
  const club = useClub(id)
  const [transferring, setTransferring] = useState<Player | null>(null)

  if (club.isLoading) return <LoadingState />
  if (club.isError || !club.data)
    return <ErrorState error={club.error} onRetry={() => club.refetch()} />

  return (
    <>
      <Link to="/admin/clubes" className="link-more" style={{ marginBottom: 12 }}>
        <ChevronLeft size={16} /> Clubes
      </Link>
      <p className="eyebrow">Plantilla del club</p>
      <h1 className="page__title" style={{ fontSize: 28, marginBottom: 20 }}>
        {club.data.name}
      </h1>

      <RosterManager
        clubId={id}
        extraActions={(player) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTransferring(player)}
            title="Transferir a otro club"
          >
            <ArrowLeftRight size={14} />
          </Button>
        )}
      />

      {transferring && (
        <TransferPlayerModal
          player={transferring}
          fromClubId={id}
          onClose={() => setTransferring(null)}
        />
      )}
    </>
  )
}
