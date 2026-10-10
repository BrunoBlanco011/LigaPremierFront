/* eslint-disable react-refresh/only-export-components -- provider + hooks juntos a propósito */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import { Modal } from './Modal'
import { Button } from '@/components/atoms/Button'
import { alertOnError } from '@/lib/mutationHelpers'

export interface ConfirmOptions {
  /** Título en forma de pregunta: "¿Eliminar a Nayiph Pérez?". */
  title: string
  /** Qué se pierde / consecuencia. */
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const Ctx = createContext<ConfirmFn | null>(null)

/** Provee un diálogo de confirmación con estilo de marca (reemplaza window.confirm). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (result: boolean) => {
    setOpts(null)
    resolver.current?.(result)
    resolver.current = null
  }

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {opts && (
        <Modal title={opts.title} onClose={() => close(false)}>
          {opts.body && (
            <p style={{ color: 'var(--color-texto-2)', margin: '0 0 8px', whiteSpace: 'pre-line' }}>
              {opts.body}
            </p>
          )}
          <div className="modal__foot">
            <Button variant="secondary" onClick={() => close(false)}>
              {opts.cancelLabel ?? 'Cancelar'}
            </Button>
            <Button variant={opts.danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
              {opts.confirmLabel ?? 'Confirmar'}
            </Button>
          </div>
        </Modal>
      )}
    </Ctx.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const c = useContext(Ctx)
  if (!c) throw new Error('useConfirm debe usarse dentro de ConfirmProvider')
  return c
}

/** Reemplazo de `confirmAndMutate`: confirma con el diálogo y, si acepta, muta.
 *  El mensaje puede traer "Título\n\nCuerpo"; se separa en pregunta y cuerpo. */
export function useConfirmMutate() {
  const confirm = useConfirm()
  return useCallback(
    <TData, TError, TVars>(
      message: string,
      mutation: UseMutationResult<TData, TError, TVars, unknown>,
      variables: TVars,
      opts?: { confirmLabel?: string; danger?: boolean },
    ) => {
      const [title, ...rest] = message.split('\n\n')
      void confirm({
        title,
        body: rest.join('\n\n') || undefined,
        danger: opts?.danger ?? true,
        confirmLabel: opts?.confirmLabel ?? 'Eliminar',
      }).then((ok) => {
        if (ok) mutation.mutate(variables, { onError: alertOnError })
      })
    },
    [confirm],
  )
}
