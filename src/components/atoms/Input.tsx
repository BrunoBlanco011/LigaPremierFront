import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = '', ...rest }, ref) => {
    const classes = ['input', hasError && 'input--error', className]
      .filter(Boolean)
      .join(' ')
    return <input ref={ref} className={classes} {...rest} />
  },
)
Input.displayName = 'Input'
