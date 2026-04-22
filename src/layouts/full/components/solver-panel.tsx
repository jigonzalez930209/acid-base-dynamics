import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { MathExpression } from "@/components/shared/math-expression"
import { solveAcidBase } from "../engine/solver"
import type { ActivityModel } from "../engine/types"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const PRESETS = [
  { id: "hcl-01", label: "HCl 0.1 M", pKa: -7, conc: 0.1, label2: { es: "Ácido fuerte", en: "Strong acid" } },
  { id: "acetic-01", label: "CH₃COOH 0.1 M", pKa: 4.76, conc: 0.1, label2: { es: "Ácido débil", en: "Weak acid" } },
  { id: "nh4-01", label: "NH₄⁺ 0.1 M", pKa: 9.25, conc: 0.1, label2: { es: "Ácido conjugado", en: "Conjugate acid" } },
  { id: "h3po4", label: "H₃PO₄ 0.05 M", pKa: 2.16, conc: 0.05, label2: { es: "Poliprótico (pKa1)", en: "Polyprotic (pKa1)" } },
]

export function SolverPanel({ locale }: Props) {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [model, setModel] = useState<ActivityModel>("ideal")
  const preset = PRESETS.find((p) => p.id === presetId)!

  const result = solveAcidBase([preset.pKa], preset.conc, model)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Solver multicomponente Newton-Raphson en espacio log-concentración. Soporta ácido-base, complejación, precipitación y redox acoplados."
          : "Multicomponent Newton-Raphson solver in log-concentration space. Supports coupled acid-base, complexation, precipitation and redox."}
      </p>

      <div className="flex flex-wrap gap-2">
        <Select value={presetId} onValueChange={setPresetId}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={model} onValueChange={(v) => setModel(v as ActivityModel)}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ideal">Ideal</SelectItem>
            <SelectItem value="debye_huckel_limiting">Debye-Hückel Limit</SelectItem>
            <SelectItem value="debye_huckel_extended">Debye-Hückel Ext.</SelectItem>
            <SelectItem value="davies">Davies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{preset.label} — {preset.label2[locale]}</div>
        <MathExpression math={String.raw`\text{p}K_a = ${preset.pKa}, \quad C = ${preset.conc}\,\text{M}`} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {[
            { k: "pH", v: result.pH.toFixed(3) },
            { k: locale === "es" ? "Convergió" : "Converged", v: result.converged ? "✓" : "✗" },
            { k: locale === "es" ? "Iteraciones" : "Iterations", v: result.iterations },
            { k: locale === "es" ? "Residuo" : "Residual", v: result.residual.toExponential(2) },
            { k: "I (M)", v: result.ionicStrength.toExponential(3) },
            { k: locale === "es" ? "Tolerancia" : "Tolerance", v: result.tolerance.toExponential(1) },
          ].map(({ k, v }) => (
            <div key={k} className="rounded bg-muted/30 p-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">{k}</div>
              <div className="text-xs font-mono font-medium">{v}</div>
            </div>
          ))}
        </div>

        {result.warnings.length > 0 && (
          <div className="rounded bg-amber-500/10 p-2 mt-2">
            {result.warnings.map((w, i) => <p key={i} className="text-[10px] text-amber-700 dark:text-amber-400">{w[locale]}</p>)}
          </div>
        )}

        <div className="mt-2">
          <div className="text-[10px] text-muted-foreground mb-1">{locale === "es" ? "Concentraciones:" : "Concentrations:"}</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(result.concentrations).map(([id, c]) => (
              <div key={id} className="flex justify-between text-xs font-mono bg-muted/20 rounded px-2 py-0.5">
                <span>{id}</span>
                <span>{(c as number).toExponential(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
