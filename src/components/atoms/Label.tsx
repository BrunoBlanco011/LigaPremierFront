import type { LabelHTMLAttributes, ReactNode } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  children: ReactNode
}

export function Label({ required, children, ...rest }: LabelProps) {
  return (
    <label className="label" {...rest}>
      {children}
      {required && <span className="label__req">*</span>}
    </label>
  )
}
