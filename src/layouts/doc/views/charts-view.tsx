import { useMemo } from "react"
import { useDoc } from "../doc-context"
import { SankeyChart } from "../components/sankey-chart"
import { ViolinChart } from "../components/violin-chart"
import { ErrorHistogram } from "../components/error-histogram"
import { buildSankeyData } from "../engine/sankey-builder"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Figuras para el congreso",
    sankeyTitle: "Flujo de decisiones de los estudiantes",
    violinTitle: "Distribución del error: 1er intento vs duplicado",
    histogramTitle: "Histograma de error por muestra",
    back: "← Explorar",
    goExport: "Exportar →",
    noData: "Sin datos filtrados. Volvé al paso anterior y ajustá los filtros.",
  },
  en: {
    title: "Congress figures",
    sankeyTitle: "Student decision flow",
    violinTitle: "Error distribution: 1st attempt vs duplicate",
    histogramTitle: "Error histogram by sample",
    back: "← Explore",
    goExport: "Export →",
    noData: "No filtered data. Go back and adjust the filters.",
  },
}

export function ChartsView({ locale }: Props) {
  const { dispatch, filteredRows } = useDoc()
  const L = LABELS[locale]

  const sankeyData = useMemo(() => buildSankeyData(filteredRows), [filteredRows])

  if (filteredRows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <p>{L.noData}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO", step: "explore" })}
          className="mt-4 text-primary hover:underline"
        >
          {L.back}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-base font-semibold text-foreground">{L.title}</h2>

      <SankeyChart data={sankeyData} title={L.sankeyTitle} />
      <ViolinChart rows={filteredRows} title={L.violinTitle} locale={locale} />
      <ErrorHistogram rows={filteredRows} title={L.histogramTitle} locale={locale} />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO", step: "explore" })}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {L.back}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO", step: "export" })}
          className="flex-[2] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
        >
          {L.goExport}
        </button>
      </div>
    </div>
  )
}
