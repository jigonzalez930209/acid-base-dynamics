import { buildHTMLReport } from "../engine/report-builder"
import { computeGroupStats, aggregateBy } from "../engine/aggregator"
import { useDoc } from "../doc-context"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { title: "Exportar", downloadCsv: "Descargar CSV", downloadReport: "Descargar reporte HTML", print: "Imprimir / PDF", svgs: "Descargar figuras SVG" },
  en: { title: "Export", downloadCsv: "Download CSV", downloadReport: "Download HTML report", print: "Print / PDF", svgs: "Download SVG figures" },
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadSvgById(id: string, filename: string) {
  const el = document.getElementById(id)
  if (!el) return
  const svgStr = new XMLSerializer().serializeToString(el)
  const blob = new Blob([svgStr], { type: "image/svg+xml" })
  downloadBlob(blob, filename)
}

export function ExportPanel({ locale }: Props) {
  const { state, filteredRows } = useDoc()
  const L = LABELS[locale]

  function handleCsv() {
    const headers = ["rowIndex", "studentId", "commission", "week", "sample", "phRead", "volumeAttempt1", "indicatorChosen", "volumeDuplicate", "errorAttempt1", "errorDuplicate", "successAttempt1", "successDuplicate"]
    const lines = [
      headers.join(","),
      ...filteredRows.map((r) => [
        r._rowIndex, r.studentId, r.commission, r.week, r.sample, r.phRead,
        r.volumeAttempt1, r.indicatorChosen, r.volumeDuplicate ?? "",
        r.errorAttempt1.toFixed(2), r.errorDuplicate?.toFixed(2) ?? "",
        r.successAttempt1, r.successDuplicate ?? "",
      ].join(",")),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    downloadBlob(blob, "tp-fosfatos-resultados.csv")
  }

  function handleReport() {
    const stats = computeGroupStats(filteredRows)
    const byGroup = aggregateBy(filteredRows, "sample")
    const html = buildHTMLReport({
      title: state.reportTitle,
      date: new Date().toLocaleDateString("es-AR"),
      n: filteredRows.length,
      stats,
      byGroup: byGroup.map((g) => ({ label: g.label, stats: g.stats })),
    })
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    downloadBlob(blob, "reporte-tp-fosfatos.html")
  }

  const svgFigures = [
    { id: "sankey-svg", name: "sankey" },
    { id: "violin-svg", name: "violin" },
    { id: "histogram-svg", name: "histograma" },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{L.title}</h3>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCsv}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </svg>
          {L.downloadCsv}
        </button>

        <button
          type="button"
          onClick={handleReport}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          {L.downloadReport}
        </button>

        {svgFigures.map(({ id, name }) => (
          <button
            key={id}
            type="button"
            onClick={() => downloadSvgById(id, `${name}.svg`)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            SVG: {name}
          </button>
        ))}

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:col-span-2"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          {L.print}
        </button>
      </div>
    </div>
  )
}
