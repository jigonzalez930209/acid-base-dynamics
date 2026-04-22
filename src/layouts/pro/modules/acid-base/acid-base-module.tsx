/**
 * Acid-Base Module — Speciation, titration, buffer, predominance, sensitivity.
 */
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemChart } from "../../components/charts/chem-chart"
import { ChemGrid } from "../../components/grids/chem-grid"
import { ACID_DATABASE } from "@/data/acids"
import {
  calcAlphas,
  buildSpeciationSeries,
  buildTitrationSeries,
  classifyPH,
} from "@/features/chemistry/lib/acid-math"
import {
  buildBufferCapacitySeries,
  buildSensitivitySeries,
  buildPredominanceSeries,
} from "@/features/advanced/advanced-math"
import { cn } from "@/lib/utils"
import type { ChartSeries, GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "speciation" | "titration" | "buffer" | "predominance" | "sensitivity"

const SPECIES_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "#e879f9", "#34d399", "#fb923c",
]

export function AcidBaseModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { globalPH, concentration } = useChemistry()
  const [subView, setSubView] = useState<SubView>("speciation")
  const [acidId, setAcidId] = useState("fosforico")

  const acids = useMemo(() =>
    ACID_DATABASE.filter((a) => a.pKas.length > 0).sort((a, b) => a.names[locale].localeCompare(b.names[locale])),
    [locale]
  )

  const acid = acids.find((a) => a.id === acidId) ?? acids[0]
  const pKas = acid.pKas

  const tabs: { id: SubView; label: string }[] = [
    { id: "speciation", label: locale === "es" ? "Especiación" : "Speciation" },
    { id: "titration", label: locale === "es" ? "Titulación" : "Titration" },
    { id: "buffer", label: locale === "es" ? "Buffer" : "Buffer" },
    { id: "predominance", label: locale === "es" ? "Predominancia" : "Predominance" },
    { id: "sensitivity", label: locale === "es" ? "Sensibilidad" : "Sensitivity" },
  ]

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      {/* Acid selector + Sub-tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={acidId}
          onChange={(e) => setAcidId(e.target.value)}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
        >
          {acids.map((a) => (
            <option key={a.id} value={a.id}>{a.names[locale]} ({a.formula})</option>
          ))}
        </select>

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

      {/* pKa info strip */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        {pKas.map((pk, i) => (
          <span key={i} className="px-2 py-1 rounded bg-muted font-mono">
            pKa{i + 1} = {pk}
          </span>
        ))}
        <span className={cn("px-2 py-1 rounded font-medium",
          classifyPH(globalPH) === "acidic" ? "bg-red-500/10 text-red-500" :
          classifyPH(globalPH) === "basic" ? "bg-blue-500/10 text-blue-500" :
          "bg-green-500/10 text-green-500"
        )}>
          pH {globalPH.toFixed(2)}
        </span>
      </div>

      {/* View content */}
      {subView === "speciation" && <SpeciationView pKas={pKas} acid={acid} locale={locale} globalPH={globalPH} />}
      {subView === "titration" && <TitrationView pKas={pKas} concentration={concentration} locale={locale} />}
      {subView === "buffer" && <BufferView pKas={pKas} concentration={concentration} locale={locale} />}
      {subView === "predominance" && <PredominanceView pKas={pKas} acid={acid} locale={locale} />}
      {subView === "sensitivity" && <SensitivityView pKas={pKas} acid={acid} locale={locale} />}
    </div>
  )
}

/* ── Sub-views ──────────────────────────────────────────────────────────── */

function SpeciationView({ pKas, acid, locale, globalPH }: { pKas: number[]; acid: { equilibriumSpecies?: string[]; formula: string }; locale: Locale; globalPH: number }) {
  const specData = useMemo(() => buildSpeciationSeries(pKas), [pKas])
  const alphas = useMemo(() => calcAlphas(globalPH, pKas), [globalPH, pKas])

  const series: ChartSeries[] = specData.map((data, i) => ({
    label: acid.equilibriumSpecies?.[i] ?? `α${i}`,
    data,
    color: SPECIES_COLORS[i % SPECIES_COLORS.length],
  }))

  const columns: GridColumn[] = [
    { field: "species", headerName: locale === "es" ? "Especie" : "Species" },
    { field: "alpha", headerName: "α", cellRenderer: "number" },
    { field: "percent", headerName: "%", cellRenderer: "number" },
  ]

  const gridData = alphas.map((a, i) => ({
    species: acid.equilibriumSpecies?.[i] ?? `α${i}`,
    alpha: a,
    percent: a * 100,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <ChemChart
          title={locale === "es" ? "Diagrama de especiación" : "Speciation diagram"}
          series={series}
          xLabel="pH"
          yLabel="α"
          xMin={0} xMax={14}
          yMin={0} yMax={1}
        />
      </div>
      <div>
        <ChemGrid
          title={`pH = ${globalPH.toFixed(2)}`}
          columns={columns}
          data={gridData}
          compact
        />
      </div>
    </div>
  )
}

function TitrationView({ pKas, concentration, locale }: { pKas: number[]; concentration: number; locale: Locale }) {
  const titData = useMemo(() => buildTitrationSeries(pKas, concentration, concentration), [pKas, concentration])

  const series: ChartSeries[] = [{
    label: locale === "es" ? "Curva de titulación" : "Titration curve",
    data: titData,
    color: "var(--chart-1)",
  }]

  return (
    <ChemChart
      title={locale === "es" ? "Curva de titulación" : "Titration curve"}
      series={series}
      xLabel={locale === "es" ? "Volumen NaOH (mL)" : "NaOH Volume (mL)"}
      yLabel="pH"
      yMin={0} yMax={14}
    />
  )
}

function BufferView({ pKas, concentration, locale }: { pKas: number[]; concentration: number; locale: Locale }) {
  const bufData = useMemo(() => buildBufferCapacitySeries(pKas, concentration), [pKas, concentration])

  const series: ChartSeries[] = [{
    label: "β",
    data: bufData,
    color: "var(--chart-3)",
  }]

  return (
    <ChemChart
      title={locale === "es" ? "Capacidad buffer" : "Buffer capacity"}
      series={series}
      xLabel="pH"
      yLabel="β (M)"
      xMin={0} xMax={14}
    />
  )
}

function PredominanceView({ pKas, acid, locale }: { pKas: number[]; acid: { equilibriumSpecies?: string[] }; locale: Locale }) {
  const predData = useMemo(() => buildPredominanceSeries(pKas), [pKas])

  // Group into segments by dominant species
  const segments = useMemo(() => {
    const result: { dominant: number; start: number; end: number }[] = []
    let current = predData[0]
    let start = current.pH
    for (let i = 1; i < predData.length; i++) {
      if (predData[i].dominant !== current.dominant) {
        result.push({ dominant: current.dominant, start, end: predData[i - 1].pH })
        current = predData[i]
        start = current.pH
      }
    }
    result.push({ dominant: current.dominant, start, end: predData[predData.length - 1].pH })
    return result
  }, [predData])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        {locale === "es" ? "Diagrama de predominancia" : "Predominance diagram"}
      </h3>
      <div className="flex h-12 rounded-lg overflow-hidden border border-border">
        {segments.map((seg, i) => {
          const width = ((seg.end - seg.start) / 14) * 100
          const species = acid.equilibriumSpecies?.[seg.dominant] ?? `α${seg.dominant}`
          return (
            <div
              key={i}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{
                width: `${width}%`,
                backgroundColor: SPECIES_COLORS[seg.dominant % SPECIES_COLORS.length],
              }}
              title={`pH ${seg.start.toFixed(1)} – ${seg.end.toFixed(1)}`}
            >
              {width > 8 && species}
            </div>
          )
        })}
      </div>
      <div className="text-xs text-muted-foreground">
        pH 0 → 14 | {segments.length} {locale === "es" ? "zonas" : "zones"}
      </div>
    </div>
  )
}

function SensitivityView({ pKas, acid, locale }: { pKas: number[]; acid: { equilibriumSpecies?: string[] }; locale: Locale }) {
  const sensData = useMemo(() => buildSensitivitySeries(pKas), [pKas])

  const series: ChartSeries[] = sensData.map((data, i) => ({
    label: acid.equilibriumSpecies?.[i] ?? `dα${i}/dpH`,
    data,
    color: SPECIES_COLORS[i % SPECIES_COLORS.length],
  }))

  return (
    <ChemChart
      title={locale === "es" ? "Sensibilidad dα/dpH" : "Sensitivity dα/dpH"}
      series={series}
      xLabel="pH"
      yLabel="dα/dpH"
      xMin={0} xMax={14}
    />
  )
}
