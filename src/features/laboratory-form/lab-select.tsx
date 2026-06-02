import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { labSelectTriggerClassName } from './form-field'

export type LabSelectOption = {
  value: string
  label: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: readonly LabSelectOption[]
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: boolean
  className?: string
}

export function LabSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Seleccione...',
  disabled,
  'aria-invalid': ariaInvalid,
  className,
}: Props) {
  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
      onOpenChange={open => {
        if (!open) onBlur?.()
      }}
    >
      <SelectTrigger
        className={cn(labSelectTriggerClassName, className)}
        aria-invalid={ariaInvalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" align="start" sideOffset={4} className="max-h-60">
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
