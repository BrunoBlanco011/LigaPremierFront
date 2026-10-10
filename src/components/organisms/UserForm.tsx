import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UserRole } from '@/types/api'
import { useCreateUser, type UserInput } from '@/features/users/mutations'
import { ApiError, friendlyMessage } from '@/lib/errors'
import { applyApiFieldErrors } from '@/lib/formErrors'
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
      applyApiFieldErrors(err, setError, ['full_name', 'email', 'password', 'role'])
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
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
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
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
