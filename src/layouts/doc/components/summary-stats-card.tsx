import { computeGroupStats } from "../engine/aggregator"
import type { ClassifiedRow } from "../engine/classifier"

type Props = {
  rows: ClassifiedRow[]
  title?: string
  locale: "es" | "en"
}

const LABELS = {
  es: { n: "N", mean: "Error medio", median: "Mediana", std: "Desvío est.", iqr: "IQR", success1: "Éxito 1er int.", success2: "Éxito dup.", na: "N/A" },
  en: { n: "N", mean: "Mean error", median: "Median", std: "Std dev", iqr: "IQR", success1: "Success 1st", success2: "Success dup.", na: "N/A" },
}

export function SummaryStatsCard({ rows, title, locale }: Props) {
  const L = LABELS[locale]
  const stats = computeGroupStats(rows)

  const items = [
    { label: L.n, value: stats.n.toString(), mono: true },
    { label: L.mean, value: `${stats.mean.toFixed(2)} %`, mono: true },
    { label: L.median, value: `${stats.median.toFixed(2)} %`, mono: true },
    { label: L.std, value: `${stats.stdDev.toFixed(2)} %`, mono: true },
    { label: L.iqr, value: `${stats.iqr.toFixed(2)} %`, mono: true },
    { label: L.success1, value: `${(stats.successRate1 * 100).toFixed(1)} %`, mono: true },
    {
      label: L.success2,
      value: stats.successRate2 !== null ? `${(stats.successRate2 * 100).toFixed(1)} %` : L.na,
      mono: true,
    },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {title && <h4 className="text-xs font-semibold text-foreground">{title}</h4>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {items.map(({ label, value, mono }) => (
          <div key={label}>
            <dt className="text-[10px] text-muted-foreground">{label}</dt>
            <dd className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
