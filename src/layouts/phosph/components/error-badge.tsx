import type { ErrorResult } from "../engine/error-calculator"

type Props = {
  error: ErrorResult
  locale: "es" | "en"
}

const LABELS = {
  es: {
    error: "Error",
    over: "exceso",
    under: "defecto",
    matched: "respecto a",
    excellent: "Excelente",
    acceptable: "Aceptable",
    high: "Alto",
  },
  en: {
    error: "Error",
    over: "overshoot",
    under: "undershoot",
    matched: "relative to",
    excellent: "Excellent",
    acceptable: "Acceptable",
    high: "High",
  },
}

const SEVERITY_STYLES = {
  excellent: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  acceptable: {
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  high: {
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
  },
}

export function ErrorBadge({ error, locale }: Props) {
  const L = LABELS[locale]
  const styles = SEVERITY_STYLES[error.severity]
  const sign = error.percentError >= 0 ? "+" : ""
  const absError = Math.abs(error.percentError)
  const direction = error.percentError >= 0 ? L.over : L.under

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${styles.badge}`}
      role="status"
      aria-label={`${L.error}: ${sign}${absError.toFixed(1)}%`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden />
      <span className="font-mono text-lg font-bold">
        {sign}{absError.toFixed(1)} %
      </span>
      <span className="text-xs opacity-80">
        {direction} · {L.matched} {error.matchedLabel}
      </span>
      <span className="ml-1 rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold opacity-80">
        {L[error.severity]}
      </span>
    </div>
  )
}
