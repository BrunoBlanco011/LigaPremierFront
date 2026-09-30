import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError = false, className = '', children, ...rest }, ref) => {
    const classes = ['input', hasError && 'input--error', className]
      .filter(Boolean)
      .join(' ')
    return (
      <select ref={ref} className={classes} {...rest}>
        {children}
      </select>
    )
  },
)
Select.displayName = 'Select'
