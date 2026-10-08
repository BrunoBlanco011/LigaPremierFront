/** Playera verde con cuello dorado y el número en itálica blanca.
 *  Se actualiza en vivo; con error (número ocupado) el borde va en rojo. */
export function JerseyPreview({
  number,
  error = false,
  size = 112,
}: {
  number?: number | string | null
  error?: boolean
  size?: number
}) {
  const hasNumber = number !== null && number !== undefined && String(number).trim() !== ''
  const label = hasNumber ? `Jersey con el número ${number}` : 'Jersey sin número'
  const borde = error ? 'var(--color-error)' : 'var(--color-noche)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={error ? 'jersey-shake' : undefined}
    >
      <path
        d="M62 18 L40 26 L8 58 L32 92 L48 80 L48 186 L152 186 L152 80 L168 92 L192 58 L160 26 L138 18 C130 34 116 42 100 42 C84 42 70 34 62 18 Z"
        fill="var(--color-premier)"
        stroke={borde}
        strokeWidth={error ? 5 : 3}
        strokeLinejoin="round"
      />
      <path
        d="M62 18 C70 34 84 42 100 42 C116 42 130 34 138 18"
        fill="none"
        stroke="var(--color-dorado)"
        strokeWidth={6}
      />
      {hasNumber && (
        <text
          key={String(number)}
          className="jersey-num"
          x="100"
          y="146"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontWeight="800"
          fontSize="88"
          fill="#ffffff"
        >
          {number}
        </text>
      )}
    </svg>
  )
}
