import type { ReactNode } from 'react'
import { memo } from 'react'
import type { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

type Props = {
  label: ReactNode
  error?: FieldError
  hint?: string
  children: React.ReactNode
  className?: string
}

export const FormField = memo(function FormField({ label, error, hint, children, className }: Props) {
  const feedback = error?.message ?? hint

  return (
    <div className={cn('flex flex-col', className)}>
      <label className="mb-1 block text-sm font-medium leading-none">{label}</label>
      {children}
      {/* Una línea fija: evita saltos al mostrar errores sin dejar huecos grandes en móvil */}
      <p
        className={cn(
          'mt-1 h-4 overflow-hidden text-xs leading-4 line-clamp-1',
          feedback
            ? error
              ? 'text-destructive'
              : 'text-muted-foreground'
            : 'invisible',
        )}
        role={feedback && error ? 'alert' : undefined}
        aria-live="polite"
      >
        {feedback || '\u00a0'}
      </p>
    </div>
  )
})

export const labFieldFocusClassName =
  'outline-none focus:border-ring focus:ring-2 focus:ring-ring/35 focus:ring-offset-0 aria-invalid:focus:border-destructive aria-invalid:focus:ring-2 aria-invalid:focus:ring-destructive/50'

export const labInputClassName = cn(
  'flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
  labFieldFocusClassName,
)

export const labSelectTriggerClassName = cn(
  labInputClassName,
  'w-full justify-between pr-2 data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring/35 aria-invalid:data-[state=open]:border-destructive aria-invalid:data-[state=open]:ring-destructive/50',
)
