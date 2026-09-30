import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import type { Club } from '@/types/api'
import { useClubs } from '@/features/clubs/queries'
import { useDeleteClub } from '@/features/clubs/mutations'
import { ClubForm } from '@/components/organisms/ClubForm'
import { LogoUploader } from '@/components/organisms/LogoUploader'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'

export function AdminClubsPage() {
  const clubs = useClubs()
  const del = useDeleteClub()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Club | undefined>(undefined)

  const onDelete = (c: Club) => {
    const ok = window.confirm(
      `¿Eliminar el club "${c.name}"?\n\nSolo se permite si nunca se ha inscrito ` +
        `a un torneo (para no perder el historial).`,
    )
    if (ok) del.mutate(c.id, { onError: (e) => window.alert(friendlyMessage(e)) })
  }

  return (
    <>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="page__title" style={{ fontSize: 30 }}>Clubes</h1>
        </div>
        <Button
          variant="flag"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus size={16} /> Nuevo club
        </Button>
      </div>

      {clubs.isLoading ? (
        <LoadingState />
      ) : clubs.isError ? (
        <ErrorState error={clubs.error} onRetry={() => clubs.refetch()} />
      ) : !clubs.data || clubs.data.length === 0 ? (
        <EmptyState
          title="Sin clubes"
          message="Crea los clubes de la liga; luego los inscribes a cada torneo."
        />
      ) : (
        <div className="grid grid--2">
          {clubs.data.map((c) => (
            <div key={c.id} className="card card--pad">
              <LogoUploader clubId={c.id} name={c.name} logoUrl={c.logo_url} />
              <h3 style={{ margin: '14px 0 2px', fontSize: 18 }}>{c.name}</h3>
              <p className="tcard__meta">
                {c.coach_name ? `Entrenador: ${c.coach_name}` : 'Sin entrenador'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <Link
                  to={`/admin/clubes/${c.id}/jugadores`}
                  className="btn btn--outline btn--sm"
                >
                  <Users size={14} /> Plantilla
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c)
                    setFormOpen(true)
                  }}
                >
                  <Pencil size={14} /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(c)}
                  disabled={del.isPending}
                  aria-label={`Eliminar ${c.name}`}
                >
                  <Trash2 size={14} color="var(--loss)" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <ClubForm club={editing} onClose={() => setFormOpen(false)} />
      )}
    </>
  )
}
