import { usePhosph } from "../phosph-context"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    label: "Normalidad del titulante",
    hintNaOH: "Concentración exacta del NaOH (mol/L)",
    hintHCl: "Concentración exacta del HCl (mol/L)",
    placeholder: "Ej: 0.1023",
    disabledHint: "Seleccioná primero el titulante",
    unit: "mol/L",
    errorNum: "Ingresá un número válido",
    errorRange: "Debe estar entre 0.001 y 2 mol/L",
  },
  en: {
    label: "Titrant normality",
    hintNaOH: "Exact NaOH concentration (mol/L)",
    hintHCl: "Exact HCl concentration (mol/L)",
    placeholder: "e.g. 0.1023",
    disabledHint: "Select the titrant first",
    unit: "mol/L",
    errorNum: "Enter a valid number",
    errorRange: "Must be between 0.001 and 2 mol/L",
  },
}

function validate(value: string): "errorNum" | "errorRange" | null {
  if (!value) return null
  const n = parseFloat(value)
  if (isNaN(n)) return "errorNum"
  if (n <= 0 || n > 2) return "errorRange"
  return null
}

export function NormalityInput({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const L = LABELS[locale]
  const value = state.input.normality
  const titrant = state.input.titrant
  const disabled = titrant === null
  const errorKey = disabled ? null : validate(value)

  const hint = disabled
    ? L.disabledHint
    : titrant === "NaOH" ? L.hintNaOH : L.hintHCl

  return (
    <div className="space-y-1">
      <label
        htmlFor="normality-input"
        className={`block text-sm font-medium ${disabled ? "text-muted-foreground/50" : "text-foreground"}`}
      >
        {L.label}
      </label>
      <div className="relative">
        <input
          id="normality-input"
          type="number"
          inputMode="decimal"
          step="0.0001"
          min={0.001}
          max={2}
          value={value}
          disabled={disabled}
          placeholder={disabled ? "—" : L.placeholder}
          aria-describedby={errorKey ? "norm-error" : "norm-hint"}
          aria-invalid={!!errorKey}
          onChange={(e) => dispatch({ type: "SET_NORMALITY", value: e.target.value })}
          className={[
            "w-full rounded-md border px-3 py-2 pr-16 text-sm bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted-foreground/50 transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted",
            errorKey ? "border-destructive" : "border-border",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {L.unit}
        </span>
      </div>
      {errorKey ? (
        <p id="norm-error" role="alert" className="text-xs text-destructive">{L[errorKey]}</p>
      ) : (
        <p id="norm-hint" className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
