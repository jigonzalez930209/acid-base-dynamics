import { usePhosph } from "../phosph-context"
import { IndicatorPicker } from "../components/indicator-picker"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Paso 2 · Indicador utilizado",
    subtitle: "Seleccioná el indicador que usaste en la titulación",
    back: "← Volver",
    next: "Ver resultado →",
    selectFirst: "Seleccioná un indicador para continuar",
  },
  en: {
    title: "Step 2 · Indicator used",
    subtitle: "Select the indicator you used in the titration",
    back: "← Back",
    next: "See result →",
    selectFirst: "Select an indicator to continue",
  },
}

export function IndicatorView({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const L = LABELS[locale]
  const canContinue = state.input.indicatorId !== null

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{L.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{L.subtitle}</p>
      </div>

      <IndicatorPicker locale={locale} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {L.back}
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => dispatch({ type: "SUBMIT_RESULT" })}
          aria-disabled={!canContinue}
          className={[
            "flex-[2] rounded-lg px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            canContinue
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          ].join(" ")}
        >
          {canContinue ? L.next : L.selectFirst}
        </button>
      </div>
    </div>
  )
}
