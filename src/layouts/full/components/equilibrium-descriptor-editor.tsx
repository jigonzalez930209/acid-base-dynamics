import { useState } from "react"
import { ChemicalFormula } from "@/components/shared/chemical-formula"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type EqDemo = {
  id: string
  type: string
  equation: string
  logK: number
  deltaH?: number
  tempDep: string
  source: string
  restriction: { es: string; en: string }
  competition: { es: string; en: string }
}

const EQUILIBRIA: EqDemo[] = [
  { id: "eq-1", type: "acid-base", equation: "CH3COOH <=> CH3COO^- + H+", logK: -4.75, deltaH: 0, tempDep: "van_t_hoff",
    source: "Harris Ch. 9",
    restriction: { es: "Solución diluida, T=25°C, I→0", en: "Dilute solution, T=25°C, I→0" },
    competition: { es: "Sin interferencias en solución pura", en: "No interference in pure solution" } },
  { id: "eq-2", type: "complexation", equation: "Cu^{2+} + Y^{4-} <=> [CuY]^{2-}", logK: 18.80, tempDep: "none",
    source: "Harris App. I",
    restriction: { es: "Kf termodinámico. Corregir con αY⁴⁻ y αM(OH)", en: "Thermodynamic Kf. Correct with αY⁴⁻ and αM(OH)" },
    competition: { es: "Fe³⁺ interfiere por Kf mayor; enmascarar o separar", en: "Fe³⁺ interferes with higher Kf; mask or separate" } },
  { id: "eq-3", type: "precipitation", equation: "Fe(OH)3(s) <=> Fe^{3+} + 3OH^-", logK: -38.55, tempDep: "none",
    source: "Skoog App. C",
    restriction: { es: "Ksp a 25°C, precipitado amorfo (mayor si cristalino)", en: "Ksp at 25°C, amorphous precipitate (higher if crystalline)" },
    competition: { es: "Complejos FeOH²⁺ aumentan solubilidad aparente", en: "FeOH²⁺ complexes increase apparent solubility" } },
  { id: "eq-4", type: "redox", equation: "MnO4^- + 8H+ + 5e^- <=> Mn^{2+} + 4H2O", logK: 127.5, tempDep: "none",
    source: "Harris Ch. 16",
    restriction: { es: "Medio ácido H₂SO₄. E° = 1.510 V", en: "Acid medium H₂SO₄. E° = 1.510 V" },
    competition: { es: "Cl⁻ consume MnO₄⁻ si la muestra tiene HCl", en: "Cl⁻ consumes MnO₄⁻ if sample contains HCl" } },
]

export function EquilibriumDescriptorEditor({ locale }: Props) {
  const [selected, setSelected] = useState(0)
  const eq = EQUILIBRIA[selected]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Descriptor universal de equilibrios: reactivos, productos, constantes, dependencia con T, restricciones, competencia y metadatos bibliográficos."
          : "Universal equilibrium descriptor: reactants, products, constants, T dependence, restrictions, competition, and bibliographic metadata."}
      </p>

      <div className="flex gap-1.5 flex-wrap">
        {EQUILIBRIA.map((eq, i) => (
          <button key={eq.id} onClick={() => setSelected(i)}
            className={`rounded px-2 py-0.5 text-[10px] border transition-colors ${i === selected ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}>
            {eq.type}
          </button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{eq.type}</span>
          <ChemicalFormula formula={`\\ce{${eq.equation}}`} className="text-foreground text-sm" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
          <div className="rounded bg-muted/30 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground">log K</p>
            <p className="font-mono text-foreground">{eq.logK}</p>
          </div>
          <div className="rounded bg-muted/30 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground">{locale === "es" ? "Dependencia T" : "T dependence"}</p>
            <p className="font-mono text-foreground">{eq.tempDep}{eq.deltaH != null ? ` (ΔH=${eq.deltaH} kJ/mol)` : ""}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="rounded bg-muted/20 p-2">
            <span className="text-muted-foreground">{locale === "es" ? "Restricciones: " : "Restrictions: "}</span>
            <span className="text-foreground">{eq.restriction[locale]}</span>
          </div>
          <div className="rounded bg-muted/20 p-2">
            <span className="text-muted-foreground">{locale === "es" ? "Competencia: " : "Competition: "}</span>
            <span className="text-foreground">{eq.competition[locale]}</span>
          </div>
          <div className="rounded bg-muted/20 p-2">
            <span className="text-muted-foreground">{locale === "es" ? "Fuente: " : "Source: "}</span>
            <span className="text-foreground">{eq.source}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
