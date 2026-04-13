/**
 * Precipitation Module — Solubility vs pH, selective precipitation.
 */
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemChart } from "../../components/charts/chem-chart"
import { ChemGrid } from "../../components/grids/chem-grid"
import { HYDROXIDE_DATA, type HydroxideEntry } from "@/features/advanced/precipitation-data"
import { cn } from "@/lib/utils"
import type { ChartSeries, GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "solubility" | "selective"

/** Calculate log[M^n+] vs pH for hydroxide precipitation M(OH)_n */
function calcSolubilitySeries(entry: HydroxideEntry): { x: number; y: number }[] {
  const { Ksp, n } = entry
  const data: { x: number; y: number }[] = []
  for (let pH = 0; pH <= 14; pH += 0.1) {
    const pOH = 14 - pH
    const OH = Math.pow(10, -pOH)
    const metalConc = Ksp / Math.pow(OH, n)
    const logM = Math.log10(metalConc)
    if (logM >= -12 && logM <= 2) {
      data.push({ x: Number(pH.toFixed(2)), y: Number(logM.toFixed(3)) })
    }
  }
  return data
}

/** pH at which precipitation starts for given metal concentration */
function calcPrecipitationPH(Ksp: number, n: number, metalConc: number): number {
  const OH = Math.pow(Ksp / metalConc, 1 / n)
  const pOH = -Math.log10(OH)
  return 14 - pOH
}

export function PrecipitationModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { globalPH, concentration } = useChemistry()

  const [subView, setSubView] = useState<SubView>("solubility")
  const [selectedIds, setSelectedIds] = useState<string[]>(["fe-oh3", "cu-oh2", "zn-oh2"])

  const tabs: { id: SubView; label: string }[] = [
    { id: "solubility", label: locale === "es" ? "Solubilidad vs pH" : "Solubility vs pH" },
    { id: "selective", label: locale === "es" ? "Precipitación selectiva" : "Selective precipitation" },
  ]

  const toggleCompound = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-colors",
                subView === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compound checkboxes */}
      <div className="flex flex-wrap gap-2">
        {HYDROXIDE_DATA.map((entry) => (
          <label key={entry.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.includes(entry.id)}
              onChange={() => toggleCompound(entry.id)}
              className="rounded border-input"
            />
            {entry.label[locale]}
          </label>
        ))}
      </div>

      {subView === "solubility" && (
        <SolubilityView selectedIds={selectedIds} locale={locale} />
      )}
      {subView === "selective" && (
        <SelectiveView selectedIds={selectedIds} concentration={concentration} globalPH={globalPH} locale={locale} />
      )}
    </div>
  )
}

const COMPOUND_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "#e879f9", "#34d399", "#fb923c", "#a78bfa", "#f472b6",
]

function SolubilityView({ selectedIds, locale }: { selectedIds: string[]; locale: Locale }) {
  const selected = HYDROXIDE_DATA.filter((e) => selectedIds.includes(e.id))

  const series: ChartSeries[] = useMemo(() =>
    selected.map((entry, i) => ({
      label: entry.formula,
      data: calcSolubilitySeries(entry),
      color: COMPOUND_COLORS[i % COMPOUND_COLORS.length],
    })),
    [selected]
  )

  return (
    <ChemChart
      title={locale === "es" ? "Solubilidad vs pH" : "Solubility vs pH"}
      series={series}
      xLabel="pH"
      yLabel="log [M]"
      xMin={0} xMax={14}
    />
  )
}

function SelectiveView({
  selectedIds, concentration, globalPH, locale,
}: {
  selectedIds: string[]; concentration: number; globalPH: number; locale: Locale
}) {
  const selected = HYDROXIDE_DATA.filter((e) => selectedIds.includes(e.id))

  const columns: GridColumn[] = [
    { field: "compound", headerName: locale === "es" ? "Compuesto" : "Compound" },
    { field: "Ksp", headerName: "Ksp", cellRenderer: "number" },
    { field: "pHStart", headerName: locale === "es" ? "pH inicio" : "pH start", cellRenderer: "ph" },
    { field: "status", headerName: locale === "es" ? "Estado" : "Status", cellRenderer: "badge" },
  ]

  const data = useMemo(() =>
    selected.map((entry) => {
      const pHStart = calcPrecipitationPH(entry.Ksp, entry.n, concentration)
      return {
        compound: entry.formula,
        Ksp: entry.Ksp,
        pHStart,
        status: globalPH >= pHStart
          ? (locale === "es" ? "Precipita" : "Precipitates")
          : (locale === "es" ? "Soluble" : "Soluble"),
      }
    }).sort((a, b) => a.pHStart - b.pHStart),
    [selected, concentration, globalPH, locale]
  )

  return (
    <div className="space-y-4">
      <ChemGrid
        title={locale === "es" ? "Orden de precipitación" : "Precipitation order"}
        columns={columns}
        data={data}
      />
      <div className="text-xs text-muted-foreground">
        {locale === "es"
          ? `A pH ${globalPH.toFixed(1)}, ${data.filter((d) => d.status === "Precipita" || d.status === "Precipitates").length} de ${data.length} compuestos precipitan.`
          : `At pH ${globalPH.toFixed(1)}, ${data.filter((d) => d.status === "Precipitates").length} of ${data.length} compounds precipitate.`
        }
      </div>
    </div>
  )
}
