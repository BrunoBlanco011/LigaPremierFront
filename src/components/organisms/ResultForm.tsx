import { useState } from 'react'
import type { Match, Team } from '@/types/api'
import { useSaveResult, useForfeit } from '@/features/matches/mutations'
import { friendlyMessage } from '@/lib/errors'
import { Modal } from '@/components/molecules/Modal'
import { Label } from '@/components/atoms/Label'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'

type TeamLite = Pick<Team, 'id' | 'name'>

/** Capturar / corregir resultado (RF-26). Sin empates; forfeit fija 21-0. */
export function ResultForm({
  tournamentId,
  match,
  home,
  away,
  onClose,
}: {
  tournamentId: string
  match: Match
  home?: TeamLite
  away?: TeamLite
  onClose: () => void
}) {
  const save = useSaveResult(tournamentId)
  const forfeit = useForfeit(tournamentId)
  const [mode, setMode] = useState<'score' | 'forfeit'>('score')
  const [homeScore, setHomeScore] = useState(match.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score?.toString() ?? '')
  const [loser, setLoser] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitScore = () => {
    setError(null)
    const h = Number(homeScore)
    const a = Number(awayScore)
    if (homeScore === '' || awayScore === '') {
      setError('Captura ambos marcadores.')
      return
    }
    if (h === a) {
      setError('No hay empates: el marcador debe incluir el tiempo extra.')
      return
    }
    save.mutate(
      { id: match.id, home_score: h, away_score: a },
      { onSuccess: onClose, onError: (e) => setError(friendlyMessage(e)) },
    )
  }

  const submitForfeit = () => {
    setError(null)
    if (!loser) {
      setError('Elige qué equipo pierde por forfeit.')
      return
    }
    forfeit.mutate(
      { id: match.id, loserTeamId: loser },
      { onSuccess: onClose, onError: (e) => setError(friendlyMessage(e)) },
    )
  }

  return (
    <Modal title="Capturar resultado" onClose={onClose}>
      {error && <div className="login-card__error">{error}</div>}

      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={`tab${mode === 'score' ? ' is-active' : ''}`} onClick={() => setMode('score')}>
          Marcador
        </button>
        <button className={`tab${mode === 'forfeit' ? ' is-active' : ''}`} onClick={() => setMode('forfeit')}>
          Forfeit
        </button>
      </div>

      {mode === 'score' ? (
        <>
          <div className="form-row">
            <div className="field">
              <Label htmlFor="hs">{home?.name ?? 'Local'}</Label>
              <Input
                id="hs"
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
              />
            </div>
            <div className="field">
              <Label htmlFor="as">{away?.name ?? 'Visitante'}</Label>
              <Input
                id="as"
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
              />
            </div>
          </div>
          <div className="modal__foot">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="flag" onClick={submitScore} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar resultado'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 16 }}>
            El sistema fija el marcador en 21-0 a favor del rival.
          </p>
          <div className="field">
            <Label htmlFor="loser" required>Equipo que pierde</Label>
            <Select id="loser" value={loser} onChange={(e) => setLoser(e.target.value)}>
              <option value="">Selecciona…</option>
              {home && <option value={home.id}>{home.name}</option>}
              {away && <option value={away.id}>{away.name}</option>}
            </Select>
          </div>
          <div className="modal__foot">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="danger" onClick={submitForfeit} disabled={forfeit.isPending}>
              {forfeit.isPending ? 'Guardando…' : 'Marcar forfeit'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
