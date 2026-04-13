/**
 * Visualization Module — Compare scenarios, 2D maps, reports.
 */
import { useState, useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemChart } from "../../components/charts/chem-chart"
import { ACID_DATABASE } from "@/data/acids"
import { buildSpeciationSeries } from "@/features/chemistry/lib/acid-math"
import { buildBufferCapacitySeries } from "@/features/advanced/advanced-math"
import { cn } from "@/lib/utils"
import type { ChartSeries } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "compare" | "maps" | "reports"

export function VisualizationModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const [subView, setSubView] = useState<SubView>("compare")

  const tabs: { id: SubView; label: string }[] = [
    { id: "compare", label: locale === "es" ? "Comparar escenarios" : "Compare Scenarios" },
    { id: "maps", label: locale === "es" ? "Mapas 2D" : "2D Maps" },
    { id: "reports", label: locale === "es" ? "Reportes" : "Reports" },
  ]

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
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

      {subView === "compare" && <CompareView locale={locale} />}
      {subView === "maps" && <MapsView locale={locale} />}
      {subView === "reports" && <ReportsView locale={locale} />}
    </div>
  )
}

const COMPARE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

function CompareView({ locale }: { locale: Locale }) {
  const acids = ACID_DATABASE.filter((a) => a.pKas.length > 0)
  const [selectedIds, setSelectedIds] = useState(["acetico", "fosforico"])

  const toggleAcid = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const series: ChartSeries[] = useMemo(() =>
    selectedIds.flatMap((acidId, ai) => {
      const acid = acids.find((a) => a.id === acidId)
      if (!acid) return []
      const specData = buildSpeciationSeries(acid.pKas)
      return specData.map((data, si) => ({
        label: `${acid.names[locale]} α${si}`,
        data,
        color: COMPARE_COLORS[ai % COMPARE_COLORS.length],
        lineStyle: si === 0 ? "solid" as const : "dashed" as const,
      }))
    }),
    [selectedIds, acids, locale]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {acids.slice(0, 20).map((acid) => (
          <button
            key={acid.id}
            onClick={() => toggleAcid(acid.id)}
            className={cn(
              "px-2 py-1 text-xs rounded-md border transition-colors",
              selectedIds.includes(acid.id)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {acid.names[locale]}
          </button>
        ))}
      </div>
      <ChemChart
        title={locale === "es" ? "Comparación de especiación" : "Speciation comparison"}
        series={series}
        xLabel="pH" yLabel="α"
        xMin={0} xMax={14} yMin={0} yMax={1}
      />
    </div>
  )
}

function MapsView({ locale }: { locale: Locale }) {
  const [acidId, setAcidId] = useState("fosforico")
  const acids = ACID_DATABASE.filter((a) => a.pKas.length > 0)
  const acid = acids.find((a) => a.id === acidId) ?? acids[0]

  /** 2D heatmap: pH (x) vs concentration (y) → buffer capacity (color) */
  const heatmapData = useMemo(() => {
    const rows: { pH: number; logC: number; beta: number }[] = []
    for (let logC = -4; logC <= 0; logC += 0.5) {
      const c = Math.pow(10, logC)
      const bufSeries = buildBufferCapacitySeries(acid.pKas, c, 0, 14, 0.5)
      for (const pt of bufSeries) {
        rows.push({ pH: pt.x, logC, beta: pt.y })
      }
    }
    return rows
  }, [acid.pKas])

  // Render as a grid of colored cells
  const pHs = [...new Set(heatmapData.map((d) => d.pH))].sort((a, b) => a - b)
  const logCs = [...new Set(heatmapData.map((d) => d.logC))].sort((a, b) => b - a)
  const maxBeta = Math.max(...heatmapData.map((d) => d.beta), 1e-6)

  return (
    <div className="space-y-4">
      <select
        value={acidId}
        onChange={(e) => setAcidId(e.target.value)}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
      >
        {acids.map((a) => (
          <option key={a.id} value={a.id}>{a.names[locale]}</option>
        ))}
      </select>

      <h3 className="text-sm font-medium">
        {locale === "es" ? "Mapa de capacidad buffer" : "Buffer capacity map"}
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-grid gap-px" style={{ gridTemplateColumns: `40px repeat(${pHs.length}, 1fr)` }}>
          {/* Header row */}
          <div className="text-[9px] text-muted-foreground" />
          {pHs.map((pH) => (
            <div key={pH} className="text-[9px] text-center text-muted-foreground">{pH}</div>
          ))}
          {/* Data rows */}
          {logCs.map((logC) => (
            <>
              <div key={`label-${logC}`} className="text-[9px] text-muted-foreground text-right pr-1">
                10^{logC}
              </div>
              {pHs.map((pH) => {
                const d = heatmapData.find((r) => r.pH === pH && r.logC === logC)
                const intensity = d ? Math.min(d.beta / maxBeta, 1) : 0
                return (
                  <div
                    key={`${pH}-${logC}`}
                    className="w-6 h-5 rounded-sm"
                    style={{ backgroundColor: `oklch(0.6 0.2 264 / ${intensity * 0.9 + 0.1})` }}
                    title={`pH=${pH}, C=10^${logC}, β=${d?.beta.toExponential(2)}`}
                  />
                )
              })}
            </>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{locale === "es" ? "Baja β" : "Low β"}</span>
        <div className="flex gap-px">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div key={v} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `oklch(0.6 0.2 264 / ${v})` }} />
          ))}
        </div>
        <span>{locale === "es" ? "Alta β" : "High β"}</span>
      </div>
    </div>
  )
}

function ReportsView({ locale }: { locale: Locale }) {
  const { globalPH, concentration, temperature, activityModel } = useChemistry()

  const handleExport = useCallback(() => {
    const report = {
      title: "Chemistry Analysis Report",
      date: new Date().toISOString(),
      parameters: { pH: globalPH, concentration, temperature, activityModel },
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [globalPH, concentration, temperature, activityModel])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        {locale === "es" ? "Generar reporte" : "Generate Report"}
      </h3>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-muted-foreground">pH:</span>
          <span className="font-mono">{globalPH.toFixed(2)}</span>
          <span className="text-muted-foreground">{locale === "es" ? "Concentración:" : "Concentration:"}</span>
          <span className="font-mono">{concentration} M</span>
          <span className="text-muted-foreground">{locale === "es" ? "Temperatura:" : "Temperature:"}</span>
          <span className="font-mono">{temperature}°C</span>
          <span className="text-muted-foreground">{locale === "es" ? "Modelo actividad:" : "Activity model:"}</span>
          <span className="font-mono">{activityModel}</span>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {locale === "es" ? "Exportar JSON" : "Export JSON"}
        </button>
      </div>
    </div>
  )
}
