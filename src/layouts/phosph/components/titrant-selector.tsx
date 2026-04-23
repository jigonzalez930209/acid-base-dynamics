import { usePhosph } from "../phosph-context"
import type { PhosphTitrant } from "../types"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    label: "Titulante utilizado",
    hint: "Seleccioná el reactivo que cargaste en la bureta",
    placeholder: "— Seleccioná —",
    hcl: "HCl  (ácido clorhídrico)",
    naoh: "NaOH  (hidróxido de sodio)",
    required: "Debés seleccionar el titulante para continuar",
    dirHCl: "pH ↓  a medida que agregás volumen",
    dirNaOH: "pH ↑  a medida que agregás volumen",
  },
  en: {
    label: "Titrant used",
    hint: "Select the reagent loaded in the burette",
    placeholder: "— Select —",
    hcl: "HCl  (hydrochloric acid)",
    naoh: "NaOH  (sodium hydroxide)",
    required: "You must select the titrant to continue",
    dirHCl: "pH ↓  as you add volume",
    dirNaOH: "pH ↑  as you add volume",
  },
}

const OPTIONS: { value: PhosphTitrant; color: string }[] = [
  { value: "HCl", color: "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" },
  { value: "NaOH", color: "border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300" },
]

export function TitrantSelector({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const L = LABELS[locale]
  const selected = state.input.titrant

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{L.label}</label>
      <p className="text-xs text-muted-foreground">{L.hint}</p>

      <div className="grid grid-cols-2 gap-2 pt-0.5">
        {OPTIONS.map(({ value, color }) => {
          const isSelected = selected === value
          const labelKey = value === "HCl" ? "hcl" : "naoh"
          const dirKey = value === "HCl" ? "dirHCl" : "dirNaOH"
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => dispatch({ type: "SET_TITRANT", titrant: value })}
              className={[
                "flex flex-col items-start gap-1 rounded-lg border-2 px-3 py-2.5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? color + " shadow-sm ring-2 ring-offset-2 ring-offset-background ring-primary/40"
                  : "border-border bg-background text-foreground hover:border-muted-foreground/50",
              ].join(" ")}
            >
              <span className="text-sm font-bold tracking-wide">{value}</span>
              <span className="text-[11px] leading-tight opacity-80">{L[labelKey]}</span>
              <span className="text-[10px] font-mono opacity-60">{L[dirKey]}</span>
            </button>
          )
        })}
      </div>

      {!selected && (
        <p className="text-xs text-amber-600 dark:text-amber-400 pt-0.5" role="alert">
          {L.required}
        </p>
      )}
    </div>
  )
}
