import { INDICATORS } from "../engine/indicators"
import type { ErrorResult } from "../engine/error-calculator"

type Props = {
  error: ErrorResult
  indicatorId: string
  locale: "es" | "en"
}

type Scenario =
  | "correct_indicator_low_error"
  | "correct_indicator_high_error"
  | "wrong_indicator_wrong_jump"
  | "wrong_indicator_lucky"

function getScenario(error: ErrorResult, isCorrectIndicator: boolean): Scenario {
  const lowError = error.severity === "excellent" || error.severity === "acceptable"
  if (isCorrectIndicator && lowError) return "correct_indicator_low_error"
  if (isCorrectIndicator && !lowError) return "correct_indicator_high_error"

  // Wrong indicator
  if (lowError) return "wrong_indicator_lucky"
  return "wrong_indicator_wrong_jump"
}

const MESSAGES: Record<Scenario, { icon: string; es: string; en: string }> = {
  correct_indicator_low_error: {
    icon: "✅",
    es: "Excelente trabajo. Elegiste el indicador correcto y tu volumen está muy cerca del punto de equivalencia teórico. La determinación es confiable y reproducible.",
    en: "Excellent work. You chose the correct indicator and your volume is very close to the theoretical equivalence point. The determination is reliable and reproducible.",
  },
  correct_indicator_high_error: {
    icon: "⚠️",
    es: "El indicador fue el correcto, pero el error en el volumen es elevado. Revisá la lectura de la bureta, si hubo burbujas de aire, o si el viraje fue difícil de detectar. Realizá el duplicado prestando atención a estos puntos.",
    en: "The indicator was correct, but the volume error is high. Check the burette reading, whether there were air bubbles, or if the color change was hard to detect. Run the duplicate paying attention to these points.",
  },
  wrong_indicator_wrong_jump: {
    icon: "❌",
    es: "El indicador elegido no es adecuado para este punto de equivalencia: su rango de viraje no coincide con el salto de pH de la curva. Esto genera un error sistemático que no se corrige con el duplicado. Seleccioná un indicador cuyo rango de viraje caiga dentro del salto de pH.",
    en: "The chosen indicator is not suitable for this equivalence point: its transition range does not match the pH jump of the curve. This produces a systematic error that cannot be corrected with a duplicate. Choose an indicator whose transition range falls within the pH jump.",
  },
  wrong_indicator_lucky: {
    icon: "⚠️",
    es: "El error es bajo, pero el indicador elegido no es el más adecuado para este punto de equivalencia. El resultado pudo ser coincidencia. En futuros ensayos usa el indicador recomendado para garantizar reproducibilidad.",
    en: "The error is low, but the chosen indicator is not the most suitable for this equivalence point. The result may have been coincidence. In future experiments use the recommended indicator to ensure reproducibility.",
  },
}

export function FeedbackCard({ error, indicatorId, locale }: Props) {
  const indicator = INDICATORS.find((i) => i.id === indicatorId)
  const isCorrectIndicator = indicator?.suitableFor.length === 0
    ? false
    : indicator?.suitableFor.some((ep) => {
        const match = error.matchedLabel
        if (ep === 1 && (match === "V₁eq" || match === "V1eq")) return true
        if (ep === 2 && (match === "V₂eq" || match === "V2eq")) return true
        return false
      }) ?? false

  const scenario = getScenario(error, isCorrectIndicator)
  const message = MESSAGES[scenario]

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>{message.icon}</span>
        <span className="text-sm font-semibold text-foreground">
          {locale === "es" ? "Retroalimentación" : "Feedback"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {message[locale]}
      </p>
    </div>
  )
}
