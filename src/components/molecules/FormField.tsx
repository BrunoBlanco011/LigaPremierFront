import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Label } from '@/components/atoms/Label'
import { Input } from '@/components/atoms/Input'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, required, error, hint, id, ...rest }, ref) => {
    const fieldId = id ?? rest.name
    return (
      <div className="field">
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          hasError={Boolean(error)}
          aria-invalid={Boolean(error)}
          required={required}
          {...rest}
        />
        {error ? (
          <p className="field__error">{error}</p>
        ) : (
          hint && <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>{hint}</p>
        )}
      </div>
    )
  },
)
FormField.displayName = 'FormField'
