import { useDoc } from "../doc-context"
import { FilterPanel } from "../components/filter-panel"
import { SummaryStatsCard } from "../components/summary-stats-card"
import { DataPreviewTable } from "../components/data-preview-table"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { title: "Exploración de datos", stats: "Estadísticos del conjunto filtrado", goCharts: "Ver figuras →", back: "← Volver" },
  en: { title: "Data exploration", stats: "Stats for filtered set", goCharts: "See charts →", back: "← Back" },
}

export function ExploreView({ locale }: Props) {
  const { dispatch, filteredRows } = useDoc()
  const L = LABELS[locale]

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-foreground">{L.title}</h2>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside>
          <FilterPanel locale={locale} />
        </aside>

        {/* Main content */}
        <div className="space-y-5 min-w-0">
          <SummaryStatsCard
            rows={filteredRows}
            title={L.stats}
            locale={locale}
          />
          <DataPreviewTable locale={locale} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO", step: "validate" })}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {L.back}
        </button>
        <button
          type="button"
          disabled={filteredRows.length === 0}
          onClick={() => dispatch({ type: "GO_TO", step: "charts" })}
          className="flex-[2] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {L.goCharts}
        </button>
      </div>
    </div>
  )
}
