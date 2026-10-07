import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UserRole } from '@/types/api'
import { useCreateUser, type UserInput } from '@/features/users/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/security'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'

interface FormValues {
  email: string
  password: string
  full_name: string
  role: UserRole
}

/** Alta de usuario (RF-32). */
export function UserForm({ onClose }: { onClose: () => void }) {
  const create = useCreateUser()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { role: 'coach' } })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input: UserInput = {
      email: values.email.trim(),
      password: values.password,
      full_name: values.full_name.trim(),
      role: values.role,
    }
    try {
      await create.mutateAsync(input)
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: 'Ya existe un usuario con ese correo.' })
      }
      // La política de contraseñas del servidor llega como error 422 del modelo
      if (err instanceof ApiError && err.status === 422 && err.issues?.some((i) => /contrasena/i.test(i.msg))) {
        setError('password', { message: 'La contraseña no cumple la política de seguridad.' })
      }
      setFormError(friendlyMessage(err))
    }
  })

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && <div className="login-card__error">{formError}</div>}
        <FormField
          label="Nombre completo"
          required
          error={errors.full_name?.message}
          {...register('full_name', { required: 'El nombre es obligatorio' })}
        />
        <FormField
          label="Correo"
          type="email"
          required
          error={errors.email?.message}
          {...register('email', { required: 'El correo es obligatorio' })}
        />
        <FormField
          label="Contraseña"
          type="password"
          required
          error={errors.password?.message}
          autoComplete="new-password"
          hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres, con letras y números`}
          {...register('password', {
            required: 'La contraseña es obligatoria',
            validate: (value, values) => validatePassword(value, values.email),
          })}
        />
        <div className="field">
          <Label htmlFor="role">Rol</Label>
          <Select id="role" {...register('role')}>
            <option value="coach">Coach</option>
            <option value="admin">Administrador</option>
          </Select>
        </div>
        <div className="modal__foot">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="flag" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
