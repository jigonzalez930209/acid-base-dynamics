/**
 * ChemGrid — Interactive table for scientific data.
 * Provides sorting, searching, and formatted display.
 */
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { GridColumn } from "../../types"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type Props<T extends Record<string, unknown>> = {
  columns: GridColumn[]
  data: T[]
  title?: string
  searchable?: boolean
  className?: string
  maxHeight?: string
  compact?: boolean
  onRowClick?: (row: T, index: number) => void
}

export function ChemGrid<T extends Record<string, unknown>>({
  columns, data, title, searchable = false, className, maxHeight = "400px", compact = false, onRowClick,
}: Props<T>) {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.field]
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortField) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortField]
      const vb = b[sortField]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortField, sortDir])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const py = compact ? "py-1" : "py-1.5"

  return (
    <div className={cn("flex flex-col", className)}>
      {(title || searchable) && (
        <div className="flex items-center justify-between mb-2 gap-2">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                role="searchbox"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-3 py-1 text-xs rounded-md border border-input bg-background w-44 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <div style={{ maxHeight }} className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    className={cn("text-left font-medium text-muted-foreground px-3", py, "border-b border-border",
                      col.sortable !== false && "cursor-pointer select-none hover:text-foreground")}
                    style={{ width: col.width }}
                    onClick={() => col.sortable !== false && toggleSort(col.field)}
                  >
                    <span className="flex items-center gap-1">
                      {col.headerName}
                      {col.sortable !== false && (
                        sortField === col.field
                          ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                          : <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-muted-foreground py-8">
                    No data
                  </td>
                </tr>
              ) : (
                sorted.map((row, ri) => (
                  <tr
                    key={ri}
                    className={cn(
                      "border-b border-border/50 last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row, ri)}
                  >
                    {columns.map((col) => (
                      <td key={col.field} className={cn("px-3", py)}>
                        {formatCell(row[col.field], col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground mt-1 px-1">
        {sorted.length} {sorted.length === 1 ? "row" : "rows"}
        {search && ` (filtered from ${data.length})`}
      </div>
    </div>
  )
}

function formatCell(value: unknown, col: GridColumn): React.ReactNode {
  if (value == null) return "—"
  if (col.valueFormatter) return col.valueFormatter(value)
  if (col.cellRenderer === "number" && typeof value === "number") {
    return value.toPrecision(4)
  }
  if (col.cellRenderer === "ph" && typeof value === "number") {
    return <span className="font-mono">{value.toFixed(2)}</span>
  }
  if (col.cellRenderer === "badge") {
    return <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{String(value)}</span>
  }
  if (col.cellRenderer === "status") {
    const s = String(value)
    const color = s === "high" || s === "alta" ? "text-destructive" : s === "medium" || s === "media" ? "text-accent" : "text-muted-foreground"
    return <span className={color}>{s}</span>
  }
  return String(value)
}
