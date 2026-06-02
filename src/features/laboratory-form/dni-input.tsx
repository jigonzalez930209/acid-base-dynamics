import { dniInputSchema, firstZodIssueMessage } from './schemas'

type Props = {
  id?: string
  value: string
  onChange: (digitsOnly: string) => void
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean
}

/** Solo dígitos, 7–8 caracteres (DNI argentino sin puntos). */
export function DniInput({ id, value, onChange, disabled, className, 'aria-invalid': ariaInvalid }: Props) {
  const handleChange = (raw: string) => {
    onChange(raw.replace(/\D/g, '').slice(0, 8))
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      maxLength={8}
      required
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className={className}
      value={value}
      onChange={e => handleChange(e.target.value)}
      onPaste={e => {
        e.preventDefault()
        handleChange(e.clipboardData.getData('text'))
      }}
      placeholder="Ej: 12345678"
    />
  )
}

export function dniValidationMessage(dni: string): string | null {
  if (!dni.trim()) return 'Ingresá el DNI (solo números, sin puntos).'
  const parsed = dniInputSchema.safeParse(dni)
  return parsed.success ? null : firstZodIssueMessage(parsed.error)
}
