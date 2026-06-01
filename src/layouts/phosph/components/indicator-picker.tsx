import { usePhosph } from "../phosph-context"
import { INDICATORS } from "../engine/indicators"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { recommended: "Recomendado", viraje: "Viraje", eq: "Punto eq.", legend: "Seleccioná el indicador que usaste en el laboratorio" },
  en: { recommended: "Recommended", viraje: "Transition", eq: "Eq. point", legend: "Select the indicator you used in the lab" },
}

export function IndicatorPicker({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const selected = state.input.indicatorId

  // FIXED_SAMPLE is H₃PO₄ (f_initial=0): both equivalence points are always relevant
  const relevantEqs: (1 | 2)[] = [1, 2]

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{LABELS[locale].legend}</p>
      <div role="radiogroup" aria-label={locale === "es" ? "Indicador" : "Indicator"} className="space-y-2">
        {INDICATORS.map((ind) => {
          const isSelected = selected === ind.id
          const isRecommended = ind.suitableFor.some((ep) => relevantEqs.includes(ep))

          return (
            <button
              key={ind.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => dispatch({ type: "SELECT_INDICATOR", id: ind.id })}
              className={[
                "w-full rounded-lg border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-muted-foreground/40 bg-background",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">{ind.name[locale]}</span>
                {isRecommended && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    ✓ {LABELS[locale].recommended.split(" ")[0]}
                  </span>
                )}
              </div>

              {/* Transition band visual */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  {/* Acid zone */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-l-full"
                    style={{
                      width: `${(ind.pHLow / 14) * 100}%`,
                      backgroundColor: ind.cssAcid,
                      opacity: 0.7,
                    }}
                  />
                  {/* Transition zone */}
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `${(ind.pHLow / 14) * 100}%`,
                      width: `${((ind.pHHigh - ind.pHLow) / 14) * 100}%`,
                      background: `linear-gradient(to right, ${ind.cssAcid}, ${ind.cssBase})`,
                    }}
                  />
                  {/* Base zone */}
                  <div
                    className="absolute inset-y-0 right-0 rounded-r-full"
                    style={{
                      left: `${(ind.pHHigh / 14) * 100}%`,
                      right: 0,
                      backgroundColor: ind.cssBase,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {ind.pHLow}–{ind.pHHigh}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
                {ind.note[locale]}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
