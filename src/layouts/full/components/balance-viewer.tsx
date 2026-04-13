import { MathExpression } from "@/components/shared/math-expression"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type BalanceDemo = {
  type: "mass" | "charge" | "analytical"
  title: { es: string; en: string }
  equation: string
  variables: string[]
  constraints: string[]
}

const BALANCES: BalanceDemo[] = [
  {
    type: "mass",
    title: { es: "Balance de masa — Ácido acético", en: "Mass balance — Acetic acid" },
    equation: String.raw`C_T = [\text{CH}_3\text{COOH}] + [\text{CH}_3\text{COO}^-]`,
    variables: ["C_T", "[CH₃COOH]", "[CH₃COO⁻]"],
    constraints: ["C_T = concentración analítica total"],
  },
  {
    type: "mass",
    title: { es: "Balance de masa — Fosfórico", en: "Mass balance — Phosphoric" },
    equation: String.raw`C_T = [\text{H}_3\text{PO}_4] + [\text{H}_2\text{PO}_4^-] + [\text{HPO}_4^{2-}] + [\text{PO}_4^{3-}]`,
    variables: ["C_T", "[H₃PO₄]", "[H₂PO₄⁻]", "[HPO₄²⁻]", "[PO₄³⁻]"],
    constraints: ["C_T se conserva independientemente del pH"],
  },
  {
    type: "charge",
    title: { es: "Balance de carga — Solución ácido débil", en: "Charge balance — Weak acid solution" },
    equation: String.raw`[\text{H}^+] = [\text{OH}^-] + [\text{A}^-]`,
    variables: ["[H⁺]", "[OH⁻]", "[A⁻]"],
    constraints: ["Electroneutralidad: Σ cargas positivas = Σ cargas negativas"],
  },
  {
    type: "charge",
    title: { es: "Balance de carga — EDTA con metal", en: "Charge balance — EDTA with metal" },
    equation: String.raw`2[\text{M}^{2+}] + [\text{H}^+] = [\text{OH}^-] + 2[\text{MY}^{2-}] + 4[\text{Y}^{4-}]`,
    variables: ["[M²⁺]", "[H⁺]", "[OH⁻]", "[MY²⁻]", "[Y⁴⁻]"],
    constraints: ["Balance simplificado para M²⁺ + EDTA en buffer"],
  },
  {
    type: "analytical",
    title: { es: "Restricción analítica — Titulación", en: "Analytical constraint — Titration" },
    equation: String.raw`V_b = V_0 \cdot \frac{C_a \bar{n} - [\text{H}^+] + [\text{OH}^-]}{C_b + [\text{H}^+] - [\text{OH}^-]}`,
    variables: ["V_b", "V_0", "C_a", "C_b", "n̄"],
    constraints: ["V_b ≥ 0", "V_b ≤ V_max (volumen práctico)"],
  },
]

const TYPE_COLORS: Record<string, string> = {
  mass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  charge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  analytical: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

export function BalanceViewer({ locale }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Descriptores de balance: masa, carga y restricciones analíticas. Cada sistema declara variables observables sin duplicar fórmulas en la UI."
          : "Balance descriptors: mass, charge, and analytical constraints. Each system declares observable variables without duplicating formulas in the UI."}
      </p>

      <div className="grid gap-3">
        {BALANCES.map((b, i) => (
          <div key={i} className="rounded border border-border/40 bg-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[b.type]}`}>
                {b.type}
              </span>
              <span className="text-xs font-medium text-foreground">{b.title[locale]}</span>
            </div>
            <div className="overflow-x-auto py-1">
              <MathExpression math={b.equation} block />
            </div>
            <div className="flex flex-wrap gap-1">
              {b.variables.map((v) => (
                <span key={v} className="rounded bg-muted/40 px-1.5 py-0.5 text-[9px] font-mono text-foreground">{v}</span>
              ))}
            </div>
            <ul className="text-[10px] text-muted-foreground pl-3">
              {b.constraints.map((c, j) => <li key={j}>• {c}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
