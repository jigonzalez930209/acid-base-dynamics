import type { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  error?: FieldError
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, hint, children, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium leading-none">{label}</label>
      {children}
      {error?.message && (
        <p className="text-xs text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export const labInputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive'
