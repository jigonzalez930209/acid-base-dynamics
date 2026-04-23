import { usePhosph } from "../phosph-context"

type Props = {
  locale: "es" | "en"
  /** Which volume field this input controls */
  field: "volume1" | "volume2"
}

const LABELS = {
  volume1: {
    es: { label: "Volumen 1er intento", placeholder: "Ej: 18.35", hint: "1ª lectura de bureta (mL)" },
    en: { label: "Volume 1st attempt", placeholder: "e.g. 18.35", hint: "1st burette reading (mL)" },
  },
  volume2: {
    es: { label: "Volumen duplicado", placeholder: "Ej: 18.60", hint: "2ª lectura de bureta (mL)" },
    en: { label: "Duplicate volume", placeholder: "e.g. 18.60", hint: "2nd burette reading (mL)" },
  },
}

const ERRORS = {
  es: { errorRange: "Debe estar entre 0 y 200 mL", errorNum: "Ingresá un número válido" },
  en: { errorRange: "Must be between 0 and 200 mL", errorNum: "Enter a valid number" },
}

function validate(value: string): "errorRange" | "errorNum" | null {
  if (!value) return null
  const n = parseFloat(value)
  if (isNaN(n)) return "errorNum"
  if (n < 0 || n > 200) return "errorRange"
  return null
}

export function VolumeInput({ locale, field }: Props) {
  const { state, dispatch } = usePhosph()
  const lbl = LABELS[field][locale]
  const err = ERRORS[locale]
  const value = state.input[field]
  const errorKey = validate(value)
  const inputId = `${field}-input`
  const hintId = `${field}-hint`
  const errId = `${field}-error`

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {lbl.label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          max={200}
          value={value}
          placeholder={lbl.placeholder}
          aria-describedby={errorKey ? errId : hintId}
          aria-invalid={!!errorKey}
          onChange={(e) => dispatch({ type: field === "volume1" ? "SET_VOLUME1" : "SET_VOLUME2", value: e.target.value })}
          className={[
            "w-full rounded-md border px-3 py-2 pr-12 text-sm bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted-foreground/50 transition-colors",
            errorKey ? "border-destructive" : "border-border",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          mL
        </span>
      </div>
      {errorKey ? (
        <p id={errId} role="alert" className="text-xs text-destructive">{err[errorKey]}</p>
      ) : (
        <p id={hintId} className="text-xs text-muted-foreground">{lbl.hint}</p>
      )}
    </div>
  )
}

