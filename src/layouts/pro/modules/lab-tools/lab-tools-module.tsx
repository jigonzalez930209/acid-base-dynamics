/**
 * Lab Tools Module — Solution preparation, dilutions, titration planning.
 */
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ChemGrid } from "../../components/grids/chem-grid"
import { ACID_DATABASE } from "@/data/acids"
import { calcEquivalenceVolumes } from "@/features/advanced/advanced-math"
import { cn } from "@/lib/utils"
import type { GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

type SubView = "solutions" | "dilutions" | "titration-plan"

export function LabToolsModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const [subView, setSubView] = useState<SubView>("solutions")

  const tabs: { id: SubView; label: string }[] = [
    { id: "solutions", label: locale === "es" ? "Preparar soluciones" : "Prepare Solutions" },
    { id: "dilutions", label: locale === "es" ? "Diluciones" : "Dilutions" },
    { id: "titration-plan", label: locale === "es" ? "Planificar titulación" : "Plan Titration" },
  ]

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
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

      {subView === "solutions" && <SolutionsView locale={locale} />}
      {subView === "dilutions" && <DilutionsView locale={locale} />}
      {subView === "titration-plan" && <TitrationPlanView locale={locale} />}
    </div>
  )
}

function SolutionsView({ locale }: { locale: Locale }) {
  const [solute, setSolute] = useState("NaOH")
  const [molarMass, setMolarMass] = useState(40)
  const [targetConc, setTargetConc] = useState(0.1)
  const [volume, setVolume] = useState(250)

  const massNeeded = targetConc * molarMass * (volume / 1000)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        {locale === "es" ? "Preparación de solución" : "Solution Preparation"}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            {locale === "es" ? "Soluto" : "Solute"}
          </label>
          <input
            type="text"
            value={solute}
            onChange={(e) => setSolute(e.target.value)}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            {locale === "es" ? "Masa molar (g/mol)" : "Molar mass (g/mol)"}
          </label>
          <input
            type="number"
            value={molarMass}
            onChange={(e) => setMolarMass(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            {locale === "es" ? "Concentración deseada (M)" : "Target concentration (M)"}
          </label>
          <input
            type="number"
            value={targetConc}
            onChange={(e) => setTargetConc(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0} step={0.01}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            {locale === "es" ? "Volumen final (mL)" : "Final volume (mL)"}
          </label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-lg font-bold font-mono">
          {massNeeded.toFixed(4)} g {solute}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {locale === "es"
            ? `Pesar ${massNeeded.toFixed(4)} g y disolver en agua destilada hasta ${volume} mL`
            : `Weigh ${massNeeded.toFixed(4)} g and dissolve in distilled water to ${volume} mL`
          }
        </div>
      </div>
    </div>
  )
}

function DilutionsView({ locale }: { locale: Locale }) {
  const [c1, setC1] = useState(1)
  const [c2, setC2] = useState(0.1)
  const [v2, setV2] = useState(100)

  const v1 = (c2 * v2) / c1

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        C₁V₁ = C₂V₂
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">C₁ ({locale === "es" ? "concentración stock" : "stock concentration"}, M)</label>
          <input
            type="number"
            value={c1}
            onChange={(e) => setC1(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0} step={0.01}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">C₂ ({locale === "es" ? "concentración final" : "final concentration"}, M)</label>
          <input
            type="number"
            value={c2}
            onChange={(e) => setC2(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0} step={0.01}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">V₂ ({locale === "es" ? "volumen final" : "final volume"}, mL)</label>
          <input
            type="number"
            value={v2}
            onChange={(e) => setV2(Number(e.target.value))}
            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background"
            min={0}
          />
        </div>
        <div className="flex items-end">
          <div className="rounded-xl border border-border bg-card p-3 w-full">
            <div className="text-xs text-muted-foreground">V₁ =</div>
            <div className="text-lg font-bold font-mono">{v1.toFixed(2)} mL</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TitrationPlanView({ locale }: { locale: Locale }) {
  const { concentration } = useChemistry()
  const [acidId, setAcidId] = useState("acetico")

  const acids = ACID_DATABASE.filter((a) => a.pKas.length > 0)
  const acid = acids.find((a) => a.id === acidId) ?? acids[0]

  const eqVolumes = useMemo(() =>
    calcEquivalenceVolumes(acid.pKas, concentration, concentration),
    [acid.pKas, concentration]
  )

  const columns: GridColumn[] = [
    { field: "step", headerName: locale === "es" ? "Paso" : "Step" },
    { field: "pKa", headerName: "pKa", cellRenderer: "number" },
    { field: "volume", headerName: locale === "es" ? "Vol. eq. (mL)" : "Eq. vol. (mL)", cellRenderer: "number" },
    { field: "halfPH", headerName: locale === "es" ? "pH semi-eq." : "Half-eq. pH", cellRenderer: "ph" },
  ]

  const data = acid.pKas.map((pk, i) => ({
    step: `${i + 1}`,
    pKa: pk,
    volume: eqVolumes[i] ?? 0,
    halfPH: pk,
  }))

  return (
    <div className="space-y-4">
      <select
        value={acidId}
        onChange={(e) => setAcidId(e.target.value)}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
      >
        {acids.map((a) => (
          <option key={a.id} value={a.id}>{a.names[locale]} ({a.formula})</option>
        ))}
      </select>

      <ChemGrid
        title={locale === "es" ? "Puntos de equivalencia" : "Equivalence points"}
        columns={columns}
        data={data}
      />

      <div className="text-xs text-muted-foreground">
        {locale === "es"
          ? `Concentración: ${concentration} M | Volumen muestra: 100 mL`
          : `Concentration: ${concentration} M | Sample volume: 100 mL`
        }
      </div>
    </div>
  )
}
