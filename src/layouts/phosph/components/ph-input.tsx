import { usePhosph } from "../phosph-context"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    label: "pH medido",
    placeholder: "Ej: 8.42",
    hint: "Ingresá el pH leído en el pHmetro",
    errorRange: "El pH debe estar entre 0 y 14",
    errorNum: "Ingresá un número válido",
  },
  en: {
    label: "Measured pH",
    placeholder: "e.g. 8.42",
    hint: "Enter the pH read on the pH meter",
    errorRange: "pH must be between 0 and 14",
    errorNum: "Enter a valid number",
  },
}

function validate(value: string): string | null {
  if (!value) return null
  const n = parseFloat(value)
  if (isNaN(n)) return "errorNum"
  if (n < 0 || n > 14) return "errorRange"
  return null
}

export function PHInput({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const labels = LABELS[locale]
  const value = state.input.pH
  const errorKey = validate(value)

  return (
    <div className="space-y-1">
      <label htmlFor="ph-input" className="block text-sm font-medium text-foreground">
        {labels.label}
      </label>
      <input
        id="ph-input"
        type="number"
        inputMode="decimal"
        step="0.01"
        min={0}
        max={14}
        value={value}
        placeholder={labels.placeholder}
        aria-describedby={errorKey ? "ph-error" : "ph-hint"}
        aria-invalid={!!errorKey}
        onChange={(e) => dispatch({ type: "SET_PH", value: e.target.value })}
        className={[
          "w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "placeholder:text-muted-foreground/50 transition-colors",
          errorKey ? "border-destructive" : "border-border",
        ].join(" ")}
      />
      {errorKey ? (
        <p id="ph-error" role="alert" className="text-xs text-destructive">
          {labels[errorKey as keyof typeof labels] as string}
        </p>
      ) : (
        <p id="ph-hint" className="text-xs text-muted-foreground">
          {labels.hint}
        </p>
      )}
    </div>
  )
}
