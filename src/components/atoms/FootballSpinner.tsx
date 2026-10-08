const SIZES = { sm: 16, md: 24, lg: 48, xl: 72 } as const

interface FootballSpinnerProps {
  size?: keyof typeof SIZES
  /** marca: balón verde premier con costuras blancas.
   *  inverso: balón blanco con costuras premier (sobre fondos verdes o botones). */
  tone?: 'marca' | 'inverso'
  /** Texto para lectores de pantalla. Pásalo vacío si el contenedor ya anuncia
   *  la carga (p. ej. un botón con aria-busy). */
  label?: string
  className?: string
}

/** Balón de futbol americano que gira sobre sí mismo. Reemplaza a todos los
 *  spinners. Con `prefers-reduced-motion` queda quieto. */
export function FootballSpinner({
  size = 'md',
  tone = 'marca',
  label = 'Cargando',
  className = '',
}: FootballSpinnerProps) {
  const px = SIZES[size]
  const ball = tone === 'marca' ? 'var(--color-premier)' : '#ffffff'
  const lace = tone === 'marca' ? '#ffffff' : 'var(--color-premier)'
  const stroke = size === 'sm' ? 4 : 3

  return (
    <span
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className={`inline-flex shrink-0 ${className}`.trim()}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 64 64"
        width={px}
        height={px}
        className="animate-giro-balon motion-reduce:animate-none"
      >
        <g transform="rotate(-35 32 32)">
          {/* cuero: puntas agudas, no una elipse */}
          <path d="M4 32 C14 13 50 13 60 32 C50 51 14 51 4 32 Z" fill={ball} />
          {/* franjas de los extremos */}
          <path d="M14 21 Q11 32 14 43" fill="none" stroke={lace} strokeWidth={stroke} strokeLinecap="round" />
          <path d="M50 21 Q53 32 50 43" fill="none" stroke={lace} strokeWidth={stroke} strokeLinecap="round" />
          {/* costura y agujetas (en sm solo la costura) */}
          <path d="M23 32 H41" stroke={lace} strokeWidth={stroke} strokeLinecap="round" />
          {size !== 'sm' && (
            <g stroke={lace} strokeWidth={2.5} strokeLinecap="round">
              <path d="M26 28 V36" />
              <path d="M30 28 V36" />
              <path d="M34 28 V36" />
              <path d="M38 28 V36" />
            </g>
          )}
        </g>
      </svg>
      {label && <span className="sr-only">{label}…</span>}
    </span>
  )
}
