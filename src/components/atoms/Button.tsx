import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { FootballSpinner } from './FootballSpinner'

type Variant =
  | 'primary'
  | 'secondary'
  | 'star'
  | 'ghost'
  | 'danger'
  /** alias heredados: flag → star, outline → secondary */
  | 'flag'
  | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  /** Muestra el balón (16px) y marca aria-busy. Pasa el texto en gerundio. */
  loading?: boolean
  children: ReactNode
}

// Sobre fondos sólidos (primario/peligro/dorado) el balón va blanco.
const INVERSE: Partial<Record<Variant, boolean>> = {
  primary: true,
  danger: true,
  star: true,
  flag: true,
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <FootballSpinner size="sm" tone={INVERSE[variant] ? 'inverso' : 'marca'} label="" />
      )}
      {children}
    </button>
  )
}
