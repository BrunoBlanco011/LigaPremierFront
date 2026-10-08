import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Label } from '@/components/atoms/Label'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  required?: boolean
  error?: string
}

/** Campo de contraseña con botón Mostrar/Ocultar. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, required, error, id, ...rest }, ref) => {
    const [visible, setVisible] = useState(false)
    const fieldId = id ?? rest.name

    return (
      <div className="field">
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        <div style={{ position: 'relative' }}>
          <input
            id={fieldId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`input${error ? ' input--error' : ''}`}
            style={{ paddingRight: 88 }}
            aria-invalid={Boolean(error)}
            required={required}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 'calc(var(--control-md) - 8px)',
              padding: '0 12px',
              border: 0,
              borderRadius: 6,
              background: 'transparent',
              color: 'var(--color-premier)',
              font: 'inherit',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {error && <p className="field__error">{error}</p>}
      </div>
    )
  },
)
PasswordField.displayName = 'PasswordField'
