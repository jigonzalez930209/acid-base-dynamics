/**
 * Complexation Module — Alpha fractions, conditional constants, EDTA explorer.
 */
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemChart } from "../../components/charts/chem-chart"
import { ChemGrid } from "../../components/grids/chem-grid"
import {
  calcAlphaLigand,
  calcLogKfPrime,
  calcLogKfDoublePrime,
  calcMinTitrationPH,
} from "@/features/advanced/complexation-math"
import { METALS, LIGANDS, COMPLEXATION_DATA } from "@/features/advanced/complexation-db"
import { cn } from "@/lib/utils"
import type { ChartSeries, GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "alpha" | "conditional" | "explorer"

export function ComplexationModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { globalPH } = useChemistry()

  const [subView, setSubView] = useState<SubView>("alpha")
  const [metalId, setMetalId] = useState(METALS[0]?.id ?? "")
  const [ligandId, setLigandId] = useState(LIGANDS[0]?.id ?? "")

  const metal = METALS.find((m) => m.id === metalId) ?? METALS[0]
  const ligand = LIGANDS.find((l) => l.id === ligandId) ?? LIGANDS[0]

  const entry = COMPLEXATION_DATA.find(
    (e) => e.metalId === metal?.id && e.ligandId === ligand?.id
  )

  const tabs: { id: SubView; label: string }[] = [
    { id: "alpha", label: locale === "es" ? "Fracciones α" : "α Fractions" },
    { id: "conditional", label: locale === "es" ? "K condicional" : "Conditional K" },
    { id: "explorer", label: locale === "es" ? "Explorador" : "Explorer" },
  ]

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={metalId}
          onChange={(e) => setMetalId(e.target.value)}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
        >
          {METALS.map((m) => (
            <option key={m.id} value={m.id}>{m.label[locale]} ({m.symbol})</option>
          ))}
        </select>
        <select
          value={ligandId}
          onChange={(e) => setLigandId(e.target.value)}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
        >
          {LIGANDS.map((l) => (
            <option key={l.id} value={l.id}>{l.label[locale]} ({l.abbreviation})</option>
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

      {subView === "alpha" && <AlphaView ligand={ligand} locale={locale} />}
      {subView === "conditional" && <ConditionalView metal={metal} ligand={ligand} entry={entry} locale={locale} globalPH={globalPH} />}
      {subView === "explorer" && <ExplorerView locale={locale} globalPH={globalPH} />}
    </div>
  )
}

function AlphaView({ ligand, locale }: { ligand: (typeof LIGANDS)[number]; locale: Locale }) {
  const series: ChartSeries[] = useMemo(() => {
    const data: { x: number; y: number }[] = []
    for (let pH = 0; pH <= 14; pH += 0.1) {
      data.push({ x: Number(pH.toFixed(2)), y: calcAlphaLigand(ligand, pH) })
    }
    return [{
      label: `α(${ligand.abbreviation})`,
      data,
      color: "var(--chart-2)",
    }]
  }, [ligand])

  return (
    <ChemChart
      title={locale === "es" ? `Fracción α del ligando ${ligand.abbreviation}` : `Ligand α fraction ${ligand.abbreviation}`}
      series={series}
      xLabel="pH"
      yLabel={`α(${ligand.abbreviation})`}
      xMin={0} xMax={14} yMin={0} yMax={1}
    />
  )
}

function ConditionalView({
  metal, ligand, entry, locale, globalPH,
}: {
  metal: (typeof METALS)[number]
  ligand: (typeof LIGANDS)[number]
  entry: (typeof COMPLEXATION_DATA)[number] | undefined
  locale: Locale
  globalPH: number
}) {
  const logKf = entry?.logBeta[entry.logBeta.length - 1] ?? 0

  const seriesData = useMemo(() => {
    const prime: { x: number; y: number }[] = []
    const doublePrime: { x: number; y: number }[] = []
    for (let pH = 0; pH <= 14; pH += 0.1) {
      const p = pH
      prime.push({ x: Number(p.toFixed(2)), y: calcLogKfPrime(metal, ligand, logKf, p) })
      doublePrime.push({ x: Number(p.toFixed(2)), y: calcLogKfDoublePrime(metal, ligand, logKf, p) })
    }
    return { prime, doublePrime }
  }, [metal, ligand, logKf])

  const series: ChartSeries[] = [
    { label: "log Kf'", data: seriesData.prime, color: "var(--chart-1)" },
    { label: "log Kf''", data: seriesData.doublePrime, color: "var(--chart-4)" },
  ]

  const minPH = entry ? calcMinTitrationPH(metal, ligand, logKf) : null

  return (
    <div className="space-y-4">
      <ChemChart
        title={locale === "es" ? "Constantes condicionales vs pH" : "Conditional constants vs pH"}
        series={series}
        xLabel="pH"
        yLabel="log K"
        xMin={0} xMax={14}
      />
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded bg-muted font-mono">
          log Kf = {logKf.toFixed(1)}
        </span>
        <span className="px-2 py-1 rounded bg-muted font-mono">
          log Kf'(pH {globalPH.toFixed(1)}) = {calcLogKfPrime(metal, ligand, logKf, globalPH).toFixed(2)}
        </span>
        <span className="px-2 py-1 rounded bg-muted font-mono">
          log Kf''(pH {globalPH.toFixed(1)}) = {calcLogKfDoublePrime(metal, ligand, logKf, globalPH).toFixed(2)}
        </span>
        {minPH != null && (
          <span className="px-2 py-1 rounded bg-muted font-mono">
            pH min = {minPH.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}

function ExplorerView({ locale, globalPH }: { locale: Locale; globalPH: number }) {
  const columns: GridColumn[] = [
    { field: "metal", headerName: locale === "es" ? "Metal" : "Metal" },
    { field: "ligand", headerName: locale === "es" ? "Ligando" : "Ligand" },
    { field: "logKf", headerName: "log Kf", cellRenderer: "number" },
    { field: "logKfPrime", headerName: "log Kf'", cellRenderer: "number" },
    { field: "logKfDoublePrime", headerName: "log Kf''", cellRenderer: "number" },
  ]

  const data = useMemo(() =>
    COMPLEXATION_DATA.map((entry) => {
      const m = METALS.find((x) => x.id === entry.metalId)
      const l = LIGANDS.find((x) => x.id === entry.ligandId)
      if (!m || !l) return null
      const logKf = entry.logBeta[entry.logBeta.length - 1] ?? 0
      return {
        metal: m.symbol,
        ligand: l.abbreviation,
        logKf,
        logKfPrime: calcLogKfPrime(m, l, logKf, globalPH),
        logKfDoublePrime: calcLogKfDoublePrime(m, l, logKf, globalPH),
      }
    }).filter(Boolean),
    [globalPH]
  )

  return (
    <ChemGrid
      title={`${locale === "es" ? "Explorador a" : "Explorer at"} pH ${globalPH.toFixed(2)}`}
      columns={columns}
      data={data as Record<string, unknown>[]}
      searchable
      maxHeight="500px"
    />
  )
}
