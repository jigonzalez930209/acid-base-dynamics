import { useDoc } from "../doc-context"
import { ExportPanel } from "../components/export-panel"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Exportar resultados",
    reportTitleLabel: "Título del reporte",
    reportTitlePlaceholder: "TP Fosfatos — Cohorte 2025",
    privacy: "Todos los datos se procesan localmente en tu navegador. Nada es enviado a ningún servidor.",
    back: "← Figuras",
    printHint: "Tip: usá Ctrl+P para guardar como PDF directamente.",
    summary: "Resumen de contenido generado",
    nRows: "filas analizadas",
    nFigures: "figuras disponibles",
  },
  en: {
    title: "Export results",
    reportTitleLabel: "Report title",
    reportTitlePlaceholder: "Phosphate Lab — Cohort 2025",
    privacy: "All data is processed locally in your browser. Nothing is sent to any server.",
    back: "← Charts",
    printHint: "Tip: use Ctrl+P to save as PDF directly.",
    summary: "Generated content summary",
    nRows: "rows analyzed",
    nFigures: "figures available",
  },
}

export function ExportView({ locale }: Props) {
  const { state, dispatch, filteredRows } = useDoc()
  const L = LABELS[locale]

  return (
    <div className="space-y-6 max-w-2xl mx-auto print:space-y-3">
      <h2 className="text-base font-semibold text-foreground print:hidden">{L.title}</h2>

      {/* Report title */}
      <div className="space-y-1.5 print:hidden">
        <label htmlFor="report-title" className="text-xs font-medium text-muted-foreground">
          {L.reportTitleLabel}
        </label>
        <input
          id="report-title"
          type="text"
          value={state.reportTitle}
          onChange={(e) => dispatch({ type: "SET_REPORT_TITLE", title: e.target.value })}
          placeholder={L.reportTitlePlaceholder}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-card p-4 print:hidden">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">{L.summary}</h3>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">{L.nRows}</dt>
            <dd className="text-2xl font-bold text-foreground">{filteredRows.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{L.nFigures}</dt>
            <dd className="text-2xl font-bold text-foreground">3</dd>
          </div>
        </dl>
      </div>

      {/* Export actions */}
      <ExportPanel locale={locale} />

      {/* Print hint */}
      <p className="text-xs text-muted-foreground print:hidden">{L.printHint}</p>

      {/* Privacy notice */}
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 print:hidden">
        <p className="text-xs text-emerald-700 dark:text-emerald-300">{L.privacy}</p>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "GO_TO", step: "charts" })}
        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors print:hidden"
      >
        {L.back}
      </button>
    </div>
  )
}
