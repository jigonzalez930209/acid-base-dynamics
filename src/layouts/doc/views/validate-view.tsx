import { useDoc } from "../doc-context"
import { DataPreviewTable } from "../components/data-preview-table"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Validación de datos",
    total: "Total bruto",
    valid: "Válidos",
    errors: "Con errores",
    excluded: "Excluidos",
    errorList: "Errores detectados",
    continue: "Continuar al análisis →",
    back: "← Volver",
    minValid: "Se necesitan al menos 10 filas válidas para continuar.",
    noErrors: "Sin errores detectados.",
    row: "Fila",
    field: "Campo",
    message: "Mensaje",
  },
  en: {
    title: "Data validation",
    total: "Total raw",
    valid: "Valid",
    errors: "With errors",
    excluded: "Excluded",
    errorList: "Detected errors",
    continue: "Continue to analysis →",
    back: "← Back",
    minValid: "At least 10 valid rows are needed to continue.",
    noErrors: "No errors detected.",
    row: "Row",
    field: "Field",
    message: "Message",
  },
}

export function ValidateView({ locale }: Props) {
  const { state, dispatch } = useDoc()
  const L = LABELS[locale]

  const validCount = state.rawRows.filter((r) => !state.excludedRows.has(r._rowIndex)).length
  const errorCount = state.parseErrors.filter((e) => e.level === "error").length
  const canContinue = validCount >= 10

  const statsItems = [
    { label: L.total, value: state.totalRawRows },
    { label: L.valid, value: validCount, accent: true },
    { label: L.errors, value: errorCount, danger: errorCount > 0 },
    { label: L.excluded, value: state.excludedRows.size },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-foreground">{L.title}</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsItems.map(({ label, value, accent, danger }) => (
          <div
            key={label}
            className={[
              "rounded-lg border p-3 text-center",
              accent ? "border-primary/30 bg-primary/5" : danger ? "border-destructive/30 bg-destructive/5" : "border-border bg-card",
            ].join(" ")}
          >
            <div className={`text-xl font-bold ${accent ? "text-primary" : danger ? "text-destructive" : "text-foreground"}`}>
              {value}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Data table */}
      <DataPreviewTable locale={locale} />

      {/* Error list */}
      {state.parseErrors.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground">{L.errorList}</h3>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground">{L.row}</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">{L.field}</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">{L.message}</th>
                </tr>
              </thead>
              <tbody>
                {state.parseErrors.map((e, i) => (
                  <tr key={i} className={`border-t border-border/50 ${e.level === "error" ? "bg-red-50/50 dark:bg-red-950/10" : "bg-amber-50/50 dark:bg-amber-950/10"}`}>
                    <td className="px-3 py-1.5 font-mono">{e.rowIndex}</td>
                    <td className="px-3 py-1.5">{e.field}</td>
                    <td className="px-3 py-1.5">{e.message[locale]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{L.noErrors}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO", step: "upload" })}
          className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {L.back}
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => dispatch({ type: "GO_TO", step: "explore" })}
          className={[
            "flex-[2] rounded-lg px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            canContinue
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          ].join(" ")}
        >
          {canContinue ? L.continue : L.minValid}
        </button>
      </div>
    </div>
  )
}
