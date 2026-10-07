import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useUploadClubLogo } from '@/features/clubs/mutations'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { Button } from '@/components/atoms/Button'
import { friendlyMessage } from '@/lib/errors'
import { LOGO_MAX_BYTES, LOGO_TYPES, detectImageType } from '@/lib/security'

const ACCEPTED: readonly string[] = LOGO_TYPES


/** Subida de logo del club con vista previa y validación (RF-22). */
export function LogoUploader({
  clubId,
  name,
  logoUrl,
}: {
  clubId: string
  name: string
  logoUrl: string | null
}) {
  const upload = useUploadClubLogo(clubId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Libera el object URL anterior al reemplazarlo o al desmontar.
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const pick = async (file: File) => {
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato no válido. Usa PNG, JPG o WEBP.')
      return
    }
    if (file.size > LOGO_MAX_BYTES) {
      setError('El archivo supera 2 MB.')
      return
    }
    // Un archivo renombrado (p. ej. HTML con extensión .png) se rechaza antes de subirlo
    if ((await detectImageType(file)) !== file.type) {
      setError('El archivo no es una imagen válida.')
      return
    }
    setPreview(URL.createObjectURL(file))
    upload.mutate(file, {
      onError: (e) => setError(friendlyMessage(e)),
      onSuccess: () => setPreview(null),
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {preview ? (
        <img
          src={preview}
          alt="Vista previa"
          style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <TeamBadge name={name} logoUrl={logoUrl} showName={false} size={56} />
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void pick(file)
            e.target.value = '' // permite volver a elegir el mismo archivo
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          <Upload size={14} /> {upload.isPending ? 'Subiendo…' : 'Cambiar logo'}
        </Button>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>
          PNG, JPG o WEBP · máx. 2 MB
        </p>
        {error && <p className="field__error">{error}</p>}
      </div>
    </div>
  )
}
