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

/** Valor interno para mantener el select siempre controlado cuando el formulario usa ''. */
const EMPTY_VALUE = '__lab_select_empty__'

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
      value={value === '' ? EMPTY_VALUE : value}
      onValueChange={selected => onChange(selected === EMPTY_VALUE ? '' : selected)}
      disabled={disabled}
      onOpenChange={open => {
        if (!open) onBlur?.()
      }}
    >
      <SelectTrigger
        className={cn(
          labSelectTriggerClassName,
          '!rounded-sm focus:!ring-2 focus:!ring-offset-0 aria-invalid:focus:!ring-destructive/50',
          className,
        )}
        aria-invalid={ariaInvalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        sideOffset={4}
        className="max-h-60 rounded-sm border border-zinc-700 bg-zinc-900 p-0 text-zinc-100 shadow-md ring-0"
      >
        {options.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-none px-3 py-2.5 pl-3 text-zinc-100 focus:!bg-zinc-700 focus:!text-zinc-100 data-highlighted:!bg-zinc-700 data-highlighted:!text-zinc-100 data-[state=checked]:!bg-zinc-600 data-[state=checked]:!text-zinc-50 [&_svg]:!text-zinc-300"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
