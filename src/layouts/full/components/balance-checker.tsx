import { useState } from "react"
import { MathExpression } from "@/components/shared/math-expression"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type BalanceCheck = {
  label: { es: string; en: string }
  massEq: string
  chargeEq: string
  species: { id: string; charge: number; conc: number }[]
}

const CASES: BalanceCheck[] = [
  {
    label: { es: "HCl 0.10 M", en: "HCl 0.10 M" },
    massEq: String.raw`C_{Cl} = [\text{Cl}^-] = 0.10\,\text{M}`,
    chargeEq: String.raw`[\text{H}^+] + [\text{Na}^+] = [\text{OH}^-] + [\text{Cl}^-]`,
    species: [
      { id: "H⁺", charge: 1, conc: 0.1 },
      { id: "Cl⁻", charge: -1, conc: 0.1 },
      { id: "OH⁻", charge: -1, conc: 1e-13 },
    ],
  },
  {
    label: { es: "Buffer acético 0.10/0.10 M", en: "Acetate buffer 0.10/0.10 M" },
    massEq: String.raw`C_T = [\text{CH}_3\text{COOH}] + [\text{CH}_3\text{COO}^-] = 0.10\,\text{M}`,
    chargeEq: String.raw`[\text{H}^+] + [\text{Na}^+] = [\text{OH}^-] + [\text{CH}_3\text{COO}^-]`,
    species: [
      { id: "H⁺", charge: 1, conc: 1.74e-5 },
      { id: "Na⁺", charge: 1, conc: 0.1 },
      { id: "CH₃COO⁻", charge: -1, conc: 0.1 },
      { id: "OH⁻", charge: -1, conc: 5.75e-10 },
    ],
  },
  {
    label: { es: "Na₂CO₃ 0.05 M", en: "Na₂CO₃ 0.05 M" },
    massEq: String.raw`C_T = [\text{H}_2\text{CO}_3] + [\text{HCO}_3^-] + [\text{CO}_3^{2-}] = 0.05\,\text{M}`,
    chargeEq: String.raw`[\text{H}^+] + 2[\text{Na}^+] = [\text{OH}^-] + [\text{HCO}_3^-] + 2[\text{CO}_3^{2-}]`,
    species: [
      { id: "H⁺", charge: 1, conc: 2.1e-12 },
      { id: "Na⁺", charge: 1, conc: 0.1 },
      { id: "HCO₃⁻", charge: -1, conc: 0.0046 },
      { id: "CO₃²⁻", charge: -2, conc: 0.0454 },
      { id: "OH⁻", charge: -1, conc: 4.8e-3 },
    ],
  },
]

export function BalanceChecker({ locale }: Props) {
  const [idx, setIdx] = useState(0)
  const c = CASES[idx]

  const chargeSum = c.species.reduce((s, sp) => s + sp.charge * sp.conc, 0)
  const massSum = c.species.filter((s) => s.charge !== 0 && s.id !== "H⁺" && s.id !== "OH⁻" && s.id !== "Na⁺")
    .reduce((s, sp) => s + sp.conc, 0)
  const chargeOk = Math.abs(chargeSum) < 0.01

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Verificador de balance global de carga y masa. Reporta residuos y marca inconsistencias químicas."
          : "Global charge and mass balance checker. Reports residuals and flags chemical inconsistencies."}
      </p>

      <div className="flex gap-1.5 flex-wrap">
        {CASES.map((cs, i) => (
          <Button key={i} size="sm" variant={i === idx ? "default" : "outline"} onClick={() => setIdx(i)}>
            {cs.label[locale]}
          </Button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-3">
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">{locale === "es" ? "Balance de masa:" : "Mass balance:"}</div>
          <MathExpression math={c.massEq} block />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">{locale === "es" ? "Balance de carga:" : "Charge balance:"}</div>
          <MathExpression math={c.chargeEq} block />
        </div>

        <div className="grid grid-cols-3 gap-1">
          {c.species.map((sp) => (
            <div key={sp.id} className="rounded bg-muted/30 p-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">{sp.id}</div>
              <div className="text-xs font-mono">{sp.conc.toExponential(2)}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className={`rounded px-2 py-1 text-xs font-medium ${chargeOk ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
            {locale === "es" ? "Carga:" : "Charge:"} Σz·C = {chargeSum.toExponential(2)} {chargeOk ? "✓" : "✗"}
          </div>
          <div className="rounded px-2 py-1 text-xs bg-blue-500/10 text-blue-600">
            {locale === "es" ? "Masa analito:" : "Analyte mass:"} {massSum.toExponential(3)} M
          </div>
        </div>
      </div>
    </div>
  )
}
