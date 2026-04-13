/**
 * Redox Module — Nernst equation, Pourbaix diagrams, galvanic cells.
 */
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemChart } from "../../components/charts/chem-chart"
import { ChemGrid } from "../../components/grids/chem-grid"
import { HALF_REACTIONS } from "@/features/advanced/redox-data"
import { cn } from "@/lib/utils"
import type { ChartSeries, GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "nernst" | "pourbaix" | "galvanic"

const R = 8.314462 // J/(mol·K)
const F = 96485.332 // C/mol

/** Nernst: E = E° - (RT / nF) ln Q */
function nernst(E0: number, n: number, T: number, logQ: number): number {
  const TK = T + 273.15
  return E0 - (2.303 * R * TK) / (n * F) * logQ
}

export function RedoxModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { globalPH, temperature } = useChemistry()

  const [subView, setSubView] = useState<SubView>("nernst")
  const [reactionId, setReactionId] = useState(HALF_REACTIONS[0].id)
  const [cathodeId, setCathodeId] = useState("cu2-cu")
  const [anodeId, setAnodeId] = useState("zn2-zn")

  const tabs: { id: SubView; label: string }[] = [
    { id: "nernst", label: locale === "es" ? "Ecuación de Nernst" : "Nernst Equation" },
    { id: "pourbaix", label: locale === "es" ? "Diagrama Pourbaix" : "Pourbaix Diagram" },
    { id: "galvanic", label: locale === "es" ? "Celda galvánica" : "Galvanic Cell" },
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

      {subView === "nernst" && (
        <NernstView reactionId={reactionId} setReactionId={setReactionId} temperature={temperature} locale={locale} />
      )}
      {subView === "pourbaix" && (
        <PourbaixView reactionId={reactionId} setReactionId={setReactionId} temperature={temperature} globalPH={globalPH} locale={locale} />
      )}
      {subView === "galvanic" && (
        <GalvanicView
          cathodeId={cathodeId} setCathodeId={setCathodeId}
          anodeId={anodeId} setAnodeId={setAnodeId}
          locale={locale}
        />
      )}
    </div>
  )
}

function NernstView({
  reactionId, setReactionId, temperature, locale,
}: {
  reactionId: string; setReactionId: (id: string) => void; temperature: number; locale: Locale
}) {
  const reaction = HALF_REACTIONS.find((r) => r.id === reactionId) ?? HALF_REACTIONS[0]

  const series: ChartSeries[] = useMemo(() => {
    const data: { x: number; y: number }[] = []
    for (let logQ = -6; logQ <= 6; logQ += 0.2) {
      data.push({ x: logQ, y: nernst(reaction.E0, reaction.n, temperature, logQ) })
    }
    return [{ label: `E (${reaction.label[locale]})`, data, color: "var(--chart-4)" }]
  }, [reaction, temperature, locale])

  return (
    <div className="space-y-4">
      <select
        value={reactionId}
        onChange={(e) => setReactionId(e.target.value)}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
      >
        {HALF_REACTIONS.map((r) => (
          <option key={r.id} value={r.id}>{r.label[locale]} (E° = {r.E0} V)</option>
        ))}
      </select>
      <ChemChart
        title={locale === "es" ? "E vs log Q" : "E vs log Q"}
        series={series}
        xLabel="log Q"
        yLabel="E (V)"
      />
      <div className="text-xs text-muted-foreground font-mono">
        E° = {reaction.E0} V | n = {reaction.n} | T = {temperature}°C
      </div>
    </div>
  )
}

function PourbaixView({
  reactionId, setReactionId, temperature, globalPH, locale,
}: {
  reactionId: string; setReactionId: (id: string) => void; temperature: number; globalPH: number; locale: Locale
}) {
  /**
   * Simplified Pourbaix: E = E° - (0.0592/n)·pH at 25°C
   * Generalized: E = E° - (2.303RT/nF)·pH
   */
  const series: ChartSeries[] = useMemo(() => {
    const TK = temperature + 273.15
    return HALF_REACTIONS.filter((r) => ["o2-h2o", "she", "fe3-fe2", "cu2-cu", "fe2-fe"].includes(r.id) || r.id === reactionId)
      .map((r, i) => {
        const data: { x: number; y: number }[] = []
        for (let pH = 0; pH <= 14; pH += 0.2) {
          const E = r.E0 - (2.303 * R * TK / (r.n * F)) * pH
          data.push({ x: Number(pH.toFixed(1)), y: Number(E.toFixed(4)) })
        }
        const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#e879f9"]
        return { label: r.label[locale], data, color: colors[i % colors.length] }
      })
  }, [reactionId, temperature, locale])

  return (
    <div className="space-y-4">
      <select
        value={reactionId}
        onChange={(e) => setReactionId(e.target.value)}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
      >
        {HALF_REACTIONS.map((r) => (
          <option key={r.id} value={r.id}>{r.label[locale]}</option>
        ))}
      </select>
      <ChemChart
        title={locale === "es" ? "Diagrama Pourbaix simplificado" : "Simplified Pourbaix diagram"}
        series={series}
        xLabel="pH"
        yLabel="E (V vs SHE)"
        xMin={0} xMax={14}
      />
      <div className="text-xs text-muted-foreground">
        pH = {globalPH.toFixed(1)} | T = {temperature}°C
      </div>
    </div>
  )
}

function GalvanicView({
  cathodeId, setCathodeId, anodeId, setAnodeId, locale,
}: {
  cathodeId: string; setCathodeId: (id: string) => void
  anodeId: string; setAnodeId: (id: string) => void
  locale: Locale
}) {
  const cathode = HALF_REACTIONS.find((r) => r.id === cathodeId) ?? HALF_REACTIONS[0]
  const anode = HALF_REACTIONS.find((r) => r.id === anodeId) ?? HALF_REACTIONS[0]

  const Ecell = cathode.E0 - anode.E0
  const spontaneous = Ecell > 0

  const columns: GridColumn[] = [
    { field: "role", headerName: locale === "es" ? "Electrodo" : "Electrode" },
    { field: "reaction", headerName: locale === "es" ? "Reacción" : "Reaction" },
    { field: "E0", headerName: "E° (V)", cellRenderer: "number" },
    { field: "n", headerName: "n" },
  ]

  const gridData = [
    { role: locale === "es" ? "Cátodo (reducción)" : "Cathode (reduction)", reaction: cathode.label[locale], E0: cathode.E0, n: cathode.n },
    { role: locale === "es" ? "Ánodo (oxidación)" : "Anode (oxidation)", reaction: anode.label[locale], E0: anode.E0, n: anode.n },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{locale === "es" ? "Cátodo" : "Cathode"}</label>
          <select
            value={cathodeId}
            onChange={(e) => setCathodeId(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
          >
            {HALF_REACTIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label[locale]} (E° = {r.E0} V)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{locale === "es" ? "Ánodo" : "Anode"}</label>
          <select
            value={anodeId}
            onChange={(e) => setAnodeId(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
          >
            {HALF_REACTIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label[locale]} (E° = {r.E0} V)</option>
            ))}
          </select>
        </div>
      </div>

      <ChemGrid columns={columns} data={gridData} />

      <div className={cn(
        "rounded-xl border p-4 text-center",
        spontaneous ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      )}>
        <div className="text-2xl font-bold font-mono">
          E°<sub>celda</sub> = {Ecell.toFixed(3)} V
        </div>
        <div className={cn("text-sm mt-1", spontaneous ? "text-green-600" : "text-red-600")}>
          {spontaneous
            ? (locale === "es" ? "✓ Reacción espontánea (ΔG° < 0)" : "✓ Spontaneous reaction (ΔG° < 0)")
            : (locale === "es" ? "✗ Reacción no espontánea (ΔG° > 0)" : "✗ Non-spontaneous reaction (ΔG° > 0)")
          }
        </div>
        <div className="text-xs text-muted-foreground mt-2 font-mono">
          ΔG° = −nFE° = {(-(cathode.n * F * Ecell) / 1000).toFixed(1)} kJ/mol
        </div>
      </div>
    </div>
  )
}
