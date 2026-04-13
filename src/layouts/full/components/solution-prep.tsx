import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MathExpression } from "@/components/shared/math-expression"
import { MOLAR_MASSES } from "../data/sources"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const REAGENT_LIST = Object.values(MOLAR_MASSES)

export function SolutionPrep({ locale }: Props) {
  const [speciesIdx, setSpeciesIdx] = useState(0)
  const [targetConc, setTargetConc] = useState(0.1)
  const [targetVol, setTargetVol] = useState(250)
  const [purity, setPurity] = useState(100)

  const species = REAGENT_LIST[speciesIdx]
  const M = species.M
  const massNeeded = (targetConc * targetVol / 1000) * M * (100 / purity)
  const uncertainty = massNeeded * 0.001

  const steps = locale === "es"
    ? [
      `1. Pesar ${massNeeded.toFixed(4)} g de ${species.formula} (M=${M} g/mol)`,
      `2. Transferir cuantitativamente a un matraz aforado de ${targetVol} mL`,
      `3. Disolver con agua destilada (agitación suave)`,
      `4. Aforar a ${targetVol} mL a ${25}°C`,
      `5. Homogeneizar por inversión (×10)`,
    ]
    : [
      `1. Weigh ${massNeeded.toFixed(4)} g of ${species.formula} (M=${M} g/mol)`,
      `2. Quantitatively transfer to a ${targetVol} mL volumetric flask`,
      `3. Dissolve with distilled water (gentle stirring)`,
      `4. Fill to ${targetVol} mL mark at ${25}°C`,
      `5. Homogenize by inversion (×10)`,
    ]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Preparación de soluciones: masas, diluciones, factores de corrección, incertidumbre básica y pasos operativos."
          : "Solution preparation: masses, dilutions, correction factors, basic uncertainty and operational steps."}
      </p>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">{locale === "es" ? "Reactivo" : "Reagent"}</label>
          <Select value={String(speciesIdx)} onValueChange={(v) => setSpeciesIdx(Number(v))}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REAGENT_LIST.map((s, i) => <SelectItem key={i} value={String(i)}>{s.formula} — {s.name[locale]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5 min-w-28">
          <label className="text-[9px] text-muted-foreground">C = {targetConc.toFixed(3)} M</label>
          <Slider min={0.001} max={1} step={0.001} value={[targetConc]} onValueChange={([v]) => setTargetConc(v)} />
        </div>
        <div className="space-y-0.5 min-w-28">
          <label className="text-[9px] text-muted-foreground">V = {targetVol} mL</label>
          <Slider min={25} max={1000} step={25} value={[targetVol]} onValueChange={([v]) => setTargetVol(v)} />
        </div>
        <div className="space-y-0.5 min-w-20">
          <label className="text-[9px] text-muted-foreground">{locale === "es" ? "Pureza" : "Purity"}: {purity}%</label>
          <Slider min={90} max={100} step={0.1} value={[purity]} onValueChange={([v]) => setPurity(v)} />
        </div>
      </div>

      <MathExpression math={String.raw`m = \frac{C \cdot V \cdot M}{P/100} = \frac{${targetConc} \times ${targetVol/1000} \times ${M}}{${(purity/100).toFixed(3)}} = ${massNeeded.toFixed(4)}\,\text{g}`} block />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Masa" : "Mass"}</div>
          <div className="text-xs font-mono font-bold">{massNeeded.toFixed(4)} g</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Incertidumbre" : "Uncertainty"}</div>
          <div className="text-xs font-mono font-bold">±{uncertainty.toFixed(4)} g</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">M (g/mol)</div>
          <div className="text-xs font-mono font-bold">{M}</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">n (mol)</div>
          <div className="text-xs font-mono font-bold">{(targetConc * targetVol / 1000).toFixed(5)}</div>
        </div>
      </div>

      <div className="rounded border border-border/40 bg-card p-2">
        <div className="text-[10px] font-medium mb-1">{locale === "es" ? "Procedimiento:" : "Procedure:"}</div>
        {steps.map((s, i) => <div key={i} className="text-[10px] text-muted-foreground">{s}</div>)}
      </div>
    </div>
  )
}
