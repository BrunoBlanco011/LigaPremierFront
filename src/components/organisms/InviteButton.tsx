import { useState } from 'react'
import { Link2, Copy, Check } from 'lucide-react'
import type { ClubInvite } from '@/types/api'
import { useCreateInvite } from '@/features/invites/mutations'
import { Modal } from '@/components/molecules/Modal'
import { Button } from '@/components/atoms/Button'
import { alertOnError } from '@/lib/mutationHelpers'
import { formatDateTime } from '@/lib/format'

/** Genera un link de invitación de 24 h para que los jugadores se den de alta. */
export function InviteButton({ clubId }: { clubId: string }) {
  const create = useCreateInvite(clubId)
  const [invite, setInvite] = useState<ClubInvite | null>(null)
  const [copied, setCopied] = useState(false)

  const url = invite ? `${window.location.origin}/unirse/${invite.token}` : ''

  const open = () =>
    create.mutate(undefined, { onSuccess: setInvite, onError: alertOnError })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* el usuario puede copiar manualmente */
    }
  }

  return (
    <>
      <Button variant="outline" onClick={open} disabled={create.isPending}>
        <Link2 size={16} /> {create.isPending ? 'Generando…' : 'Generar link de invitación'}
      </Button>

      {invite && (
        <Modal title="Link de invitación" onClose={() => setInvite(null)}>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 14 }}>
            Comparte este link con tus jugadores para que se den de alta solos en
            el club. Expira el <strong>{formatDateTime(invite.expires_at)}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" readOnly value={url} onFocus={(e) => e.target.select()} />
            <Button variant="flag" onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <div className="modal__foot">
            <Button variant="ghost" onClick={() => setInvite(null)}>Cerrar</Button>
          </div>
        </Modal>
      )}
    </>
  )
}
