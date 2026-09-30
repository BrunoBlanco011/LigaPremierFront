import { useState } from 'react'
import type { Player } from '@/types/api'
import { useClubs } from '@/features/clubs/queries'
import { useTransferPlayer } from '@/features/players/mutations'
import { Modal } from '@/components/molecules/Modal'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'
import { friendlyMessage } from '@/lib/errors'

/** Transferir un jugador a otro club (RF-41, solo admin). */
export function TransferPlayerModal({
  player,
  fromClubId,
  onClose,
}: {
  player: Player
  fromClubId: string
  onClose: () => void
}) {
  const clubs = useClubs()
  const transfer = useTransferPlayer(fromClubId)
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)

  const options = (clubs.data ?? []).filter((c) => c.id !== fromClubId)

  const submit = () => {
    if (!target) return
    setError(null)
    transfer.mutate(
      { id: player.id, clubId: target },
      {
        onSuccess: onClose,
        onError: (e) => setError(friendlyMessage(e)),
      },
    )
  }

  return (
    <Modal title={`Transferir a ${player.full_name}`} onClose={onClose}>
      {error && <div className="login-card__error">{error}</div>}
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 16 }}>
        Sus estadísticas anteriores se quedan con el equipo con el que las hizo.
      </p>
      <div className="field">
        <Label htmlFor="target-club">Club destino</Label>
        <Select
          id="target-club"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value="">Selecciona un club…</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="modal__foot">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="flag"
          onClick={submit}
          disabled={!target || transfer.isPending}
        >
          {transfer.isPending ? 'Transfiriendo…' : 'Transferir'}
        </Button>
      </div>
    </Modal>
  )
}
