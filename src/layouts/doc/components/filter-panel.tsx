import { useMemo } from "react"
import { useDoc } from "../doc-context"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { title: "Filtros", samples: "Muestras", commissions: "Comisiones", weeks: "Semanas", outcome: "Resultado", all: "Todos", success: "Solo éxito", fail: "Solo fallo", clear: "Limpiar", threshold: "Umbral de éxito" },
  en: { title: "Filters", samples: "Samples", commissions: "Commissions", weeks: "Weeks", outcome: "Outcome", all: "All", success: "Success only", fail: "Fail only", clear: "Clear", threshold: "Success threshold" },
}

function MultiSelect({
  options,
  selected,
  onChange,
  label,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  label: string
}) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={[
              "rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors",
              selected.includes(opt)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterPanel({ locale }: Props) {
  const { state, filteredRows, classifiedRows, dispatch } = useDoc()
  const L = LABELS[locale]
  const { filters } = state

  const allSamples = useMemo(() =>
    [...new Set(classifiedRows.map((r) => String(r.sample)))].sort(),
    [classifiedRows],
  )
  const allCommissions = useMemo(() =>
    [...new Set(classifiedRows.map((r) => r.commission))].sort(),
    [classifiedRows],
  )
  const allWeeks = useMemo(() =>
    [...new Set(classifiedRows.map((r) => String(r.week)))].sort((a, b) => +a - +b),
    [classifiedRows],
  )

  function setFilter<K extends keyof typeof filters>(key: K, value: typeof filters[K]) {
    dispatch({ type: "SET_FILTERS", filters: { [key]: value } })
  }

  const hasActiveFilters = filters.samples.length > 0 || filters.commissions.length > 0 || filters.weeks.length > 0 || filters.outcome !== "all"

  return (
    <div className="space-y-4 rounded-lg border border-border p-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{L.title}</h3>
        <span className="text-xs text-muted-foreground">{filteredRows.length} / {classifiedRows.length}</span>
      </div>

      <MultiSelect
        label={L.samples}
        options={allSamples}
        selected={filters.samples.map(String)}
        onChange={(v) => setFilter("samples", v.map(Number))}
      />

      <MultiSelect
        label={L.commissions}
        options={allCommissions}
        selected={filters.commissions}
        onChange={(v) => setFilter("commissions", v)}
      />

      <MultiSelect
        label={L.weeks}
        options={allWeeks}
        selected={filters.weeks.map(String)}
        onChange={(v) => setFilter("weeks", v.map(Number))}
      />

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">{L.outcome}</p>
        <div className="flex gap-1.5">
          {(["all", "success", "fail"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter("outcome", opt)}
              className={[
                "flex-1 rounded-md px-2 py-1 text-[11px] font-medium border transition-colors",
                filters.outcome === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50",
              ].join(" ")}
            >
              {L[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold */}
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {L.threshold}: <span className="font-mono text-foreground">{state.threshold} %</span>
        </p>
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={state.threshold}
          onChange={(e) => dispatch({ type: "SET_THRESHOLD", threshold: parseFloat(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_FILTERS", filters: { samples: [], commissions: [], weeks: [], outcome: "all" } })}
          className="w-full rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          {L.clear}
        </button>
      )}
    </div>
  )
}
