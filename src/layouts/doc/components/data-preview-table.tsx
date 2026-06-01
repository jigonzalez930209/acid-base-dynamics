import { useState } from "react"
import { useDoc } from "../doc-context"
import type { StudentRow } from "../engine/schema"

type Props = { locale: "es" | "en" }

const PAGE_SIZE = 20

const LABELS = {
  es: { title: "Vista previa de datos", excl: "Excluir", incl: "Incluir", prev: "Anterior", next: "Siguiente", page: "Página", of: "de", error: "Error", warning: "Advertencia", excluded: "Excluido", row: "Fila" },
  en: { title: "Data preview", excl: "Exclude", incl: "Include", prev: "Previous", next: "Next", page: "Page", of: "of", error: "Error", warning: "Warning", excluded: "Excluded", row: "Row" },
}

const DISPLAY_FIELDS: (keyof StudentRow)[] = ["studentId", "commission", "week", "sample", "phRead", "volumeAttempt1", "indicatorChosen", "volumeDuplicate"]

const FIELD_LABELS: Record<string, { es: string; en: string }> = {
  studentId: { es: "Alumno", en: "Student" },
  commission: { es: "Comisión", en: "Commission" },
  week: { es: "Semana", en: "Week" },
  sample: { es: "Muestra", en: "Sample" },
  phRead: { es: "pH", en: "pH" },
  volumeAttempt1: { es: "Vol1 (mL)", en: "Vol1 (mL)" },
  indicatorChosen: { es: "Indicador", en: "Indicator" },
  volumeDuplicate: { es: "Dup (mL)", en: "Dup (mL)" },
}

export function DataPreviewTable({ locale }: Props) {
  const { state, dispatch } = useDoc()
  const L = LABELS[locale]
  const [page, setPage] = useState(0)

  const rows = state.rawRows
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const errorsByRow = new Map<number, { level: string; msg: string }[]>()
  for (const e of state.parseErrors) {
    if (!errorsByRow.has(e.rowIndex)) errorsByRow.set(e.rowIndex, [])
    errorsByRow.get(e.rowIndex)!.push({ level: e.level, msg: e.message[locale] })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{L.title}</h3>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-2 text-left font-medium text-muted-foreground w-10">{L.row}</th>
              {DISPLAY_FIELDS.map((f) => (
                <th key={f} className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {FIELD_LABELS[f][locale]}
                </th>
              ))}
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">{L.excl}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const isExcluded = state.excludedRows.has(row._rowIndex)
              const rowErrors = errorsByRow.get(row._rowIndex) ?? []
              const hasError = rowErrors.some((e) => e.level === "error")
              const hasWarning = rowErrors.some((e) => e.level === "warning")

              return (
                <tr
                  key={row._rowIndex}
                  className={[
                    "border-t border-border/50 transition-colors",
                    isExcluded ? "opacity-40 bg-muted/30" : hasError ? "bg-red-50 dark:bg-red-950/20" : hasWarning ? "bg-amber-50 dark:bg-amber-950/20" : "",
                  ].join(" ")}
                >
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">{row._rowIndex}</td>
                  {DISPLAY_FIELDS.map((f) => (
                    <td key={f} className="px-2 py-1.5 max-w-[120px] truncate" title={String(row[f] ?? "")}>
                      {row[f] !== undefined ? String(row[f]) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "TOGGLE_EXCLUDE", rowIndex: row._rowIndex })}
                      className={[
                        "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                        isExcluded
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                      ].join(" ")}
                    >
                      {isExcluded ? L.incl : L.excl}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {L.page} {page + 1} {L.of} {totalPages} · {rows.length} registros
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {L.prev}
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {L.next}
          </button>
        </div>
      </div>
    </div>
  )
}
