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

export const labSelectClassName = cn(
  labInputClassName,
  "appearance-none bg-no-repeat bg-[length:1rem] bg-[position:right_8px_center] pr-9 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%23737373%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E')]",
)
