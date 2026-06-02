import type { ReactNode } from 'react'
import type { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

type Props = {
  label: ReactNode
  error?: FieldError
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, hint, children, className }: Props) {
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
}

export const labInputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive'

export const labSelectTriggerClassName = cn(
  labInputClassName,
  'w-full justify-between pr-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
)
