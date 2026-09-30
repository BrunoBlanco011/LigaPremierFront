/** Racha de resultados recientes (W/L). Flag football no tiene empates. */
export function FormPill({ form }: { form: ('W' | 'D' | 'L')[] }) {
  if (!form?.length) return <span className="tnum" style={{ color: 'var(--ink-faint)' }}>—</span>
  return (
    <span className="form-pill">
      {form.map((r, i) => (
        <span key={i} className={r} title={r === 'W' ? 'Victoria' : 'Derrota'}>
          {r}
        </span>
      ))}
    </span>
  )
}
