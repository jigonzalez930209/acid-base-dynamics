import { useMemo } from "react"
import { usePhosph } from "../phosph-context"
import { TitrationChart } from "../components/titration-chart"
import { ErrorBadge } from "../components/error-badge"
import { FeedbackCard } from "../components/feedback-card"
import { buildTitrationCurve } from "../engine/titration-curve"
import { findEquivalencePoints } from "../engine/equivalence-finder"
import { calcError } from "../engine/error-calculator"
import { SAMPLES } from "../engine/phosphate-system"
import { INDICATORS } from "../engine/indicators"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Resultado",
    reset: "Nueva titulación",
    copy: "Copiar resumen",
    theoretical: "Punto de equivalencia teórico",
    avgVolume: "Volumen promedio (V̄)",
    v1: "Volumen 1er intento",
    v2: "Volumen duplicado",
    deviation: "Desviación |V₁ − V₂|",
    indicator: "Indicador usado",
    titrant: "Titulante",
    normality: "Concentración",
    precision: "Precisión",
    precisionGood: "Buena (< 0.5 mL)",
    precisionAcc: "Aceptable (< 1 mL)",
    precisionPoor: "Pobre (≥ 1 mL)",
  },
  en: {
    title: "Result",
    reset: "New titration",
    copy: "Copy summary",
    theoretical: "Theoretical equivalence point",
    avgVolume: "Average volume (V̄)",
    v1: "Volume 1st attempt",
    v2: "Duplicate volume",
    deviation: "Deviation |V₁ − V₂|",
    indicator: "Indicator used",
    titrant: "Titrant",
    normality: "Concentration",
    precision: "Precision",
    precisionGood: "Good (< 0.5 mL)",
    precisionAcc: "Acceptable (< 1 mL)",
    precisionPoor: "Poor (≥ 1 mL)",
  },
}

function precisionLabel(dev: number, L: typeof LABELS["es"]) {
  if (dev < 0.5) return { text: L.precisionGood, cls: "text-emerald-500 dark:text-emerald-400" }
  if (dev < 1.0) return { text: L.precisionAcc, cls: "text-amber-500 dark:text-amber-400" }
  return { text: L.precisionPoor, cls: "text-red-500 dark:text-red-400" }
}

export function ResultView({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const L = LABELS[locale]
  const result = state.result!

  const indicator = INDICATORS.find((i) => i.id === result.indicatorId)!
  const sample = SAMPLES.find((s) => s.id === result.detectedSampleId) ?? SAMPLES[0]

  const eqs = useMemo(() => {
    const curve = buildTitrationCurve(sample, result.titrant, result.normality)
    return findEquivalencePoints(curve)
  }, [sample, result.titrant, result.normality])

  const error = useMemo(() => calcError(result.avgVolume, eqs), [result.avgVolume, eqs])
  const deviation = Math.abs(result.volume1 - result.volume2)
  const prec = precisionLabel(deviation, L)

  const handleCopy = () => {
    if (!error) return
    const lines = [
      `${L.titrant}: ${result.titrant} ${result.normality.toFixed(4)} mol/L`,
      `${L.indicator}: ${indicator.name[locale]}`,
      `${L.v1}: ${result.volume1.toFixed(2)} mL`,
      `${L.v2}: ${result.volume2.toFixed(2)} mL`,
      `${L.avgVolume}: ${result.avgVolume.toFixed(2)} mL`,
      `${L.deviation}: ${deviation.toFixed(2)} mL`,
      `${L.theoretical} (${error.matchedLabel}): ${error.vTheoretical.toFixed(2)} mL`,
      `Error: ${error.percentError >= 0 ? "+" : ""}${error.percentError.toFixed(1)} %`,
    ].join("\n")
    navigator.clipboard.writeText(lines).catch(() => undefined)
  }

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-foreground">{L.title}</h2>

      {/* Chart */}
      <TitrationChart result={result} locale={locale} />

      {/* Error badge */}
      {error && <ErrorBadge error={error} locale={locale} />}

      {/* Stats table */}
      {error && (
        <div className="rounded-lg border border-border bg-card p-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <dt className="text-muted-foreground">{L.titrant}:</dt>
            <dd className="font-mono font-medium text-foreground">
              {result.titrant} · {result.normality.toFixed(4)} mol/L
            </dd>

            <dt className="text-muted-foreground">{L.indicator}:</dt>
            <dd className="font-medium text-foreground">{indicator.name[locale]}</dd>

            <dt className="text-muted-foreground">{L.v1}:</dt>
            <dd className="font-mono text-foreground">{result.volume1.toFixed(2)} mL</dd>

            <dt className="text-muted-foreground">{L.v2}:</dt>
            <dd className="font-mono text-foreground">{result.volume2.toFixed(2)} mL</dd>

            <dt className="text-muted-foreground font-semibold">{L.avgVolume}:</dt>
            <dd className="font-mono font-bold text-foreground">{result.avgVolume.toFixed(2)} mL</dd>

            <dt className="text-muted-foreground">{L.deviation}:</dt>
            <dd className="font-mono text-foreground">{deviation.toFixed(2)} mL</dd>

            <dt className="text-muted-foreground">{L.precision}:</dt>
            <dd className={`font-medium ${prec.cls}`}>{prec.text}</dd>

            <dt className="text-muted-foreground">{L.theoretical} ({error.matchedLabel}):</dt>
            <dd className="font-mono text-foreground">{error.vTheoretical.toFixed(2)} mL</dd>
          </dl>
        </div>
      )}

      {/* Feedback */}
      {error && <FeedbackCard error={error} indicatorId={result.indicatorId} locale={locale} />}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {L.copy}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="flex-[2] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {L.reset}
        </button>
      </div>
    </div>
  )
}

