import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { MathExpression } from "@/components/shared/math-expression"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type RenderSample = {
  label: { es: string; en: string }
  type: "formula" | "equation" | "math" | "mixed"
  chemInput?: string
  mathInput?: string
  notes: { es: string; en: string }
}

const SAMPLES: RenderSample[] = [
  { label: { es: "Fórmula simple", en: "Simple formula" }, type: "formula", chemInput: "H2SO4", notes: { es: "Subíndices automáticos", en: "Automatic subscripts" } },
  { label: { es: "Ion con carga", en: "Charged ion" }, type: "formula", chemInput: "Fe3+", notes: { es: "Superíndice de carga", en: "Charge superscript" } },
  { label: { es: "Especie compleja", en: "Complex species" }, type: "formula", chemInput: "CaY2-", notes: { es: "Metal-ligando con carga neta", en: "Metal-ligand with net charge" } },
  { label: { es: "Ecuación redox", en: "Redox equation" }, type: "formula", chemInput: "\\ce{Fe^{2+} -> Fe^{3+} + e-}", notes: { es: "Semirreacción vía \\ce{}", en: "Half-reaction via \\ce{}" } },
  { label: { es: "Equilibrio ácido", en: "Acid equilibrium" }, type: "formula", chemInput: "\\ce{CH3COOH <=> CH3COO- + H+}", notes: { es: "Doble flecha de equilibrio", en: "Double equilibrium arrow" } },
  { label: { es: "Precipitación", en: "Precipitation" }, type: "formula", chemInput: "\\ce{Fe(OH)3 v}", notes: { es: "Flecha de precipitado ↓", en: "Precipitate arrow ↓" } },
  { label: { es: "Expresión Ka", en: "Ka expression" }, type: "math", mathInput: String.raw`K_a = \frac{[\text{A}^-][\text{H}^+]}{[\text{HA}]}`, notes: { es: "LaTeX puro para constantes", en: "Pure LaTeX for constants" } },
  { label: { es: "Henderson-Hasselbalch", en: "Henderson-Hasselbalch" }, type: "math", mathInput: String.raw`\text{pH} = \text{p}K_a + \log\frac{[\text{A}^-]}{[\text{HA}]}`, notes: { es: "Ecuación mixta texto+math", en: "Mixed text+math equation" } },
  { label: { es: "Fracción molar α₀", en: "Mole fraction α₀" }, type: "math", mathInput: String.raw`\alpha_0 = \frac{[\text{H}^+]}{[\text{H}^+] + K_a}`, notes: { es: "Letras griegas + fracciones", en: "Greek letters + fractions" } },
  { label: { es: "Balance de carga", en: "Charge balance" }, type: "math", mathInput: String.raw`\sum z_i C_i = 0`, notes: { es: "Sumatorias con subíndice", en: "Summations with subscript" } },
]

const TYPE_BADGE: Record<string, string> = {
  formula: "text-cyan-600 bg-cyan-500/10",
  equation: "text-indigo-600 bg-indigo-500/10",
  math: "text-violet-600 bg-violet-500/10",
  mixed: "text-amber-600 bg-amber-500/10",
}

export function RenderDemo({ locale }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Pipeline de render unificado: fórmulas, ecuaciones y expresiones matemáticas con soporte consistente para subíndices, superíndices, cargas, estados y notación mixta."
          : "Unified render pipeline: formulas, equations and math expressions with consistent support for subscripts, superscripts, charges, states and mixed notation."}
      </p>

      <div className="grid gap-2">
        {SAMPLES.map((s, i) => (
          <div key={i} className="rounded border border-border/40 bg-card p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 sm:w-40 shrink-0">
              <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE[s.type]}`}>
                {s.type}
              </span>
              <span className="text-xs font-medium text-foreground">{s.label[locale]}</span>
            </div>

            <div className="flex-1 overflow-x-auto py-1">
              {s.chemInput && <ChemicalFormula formula={s.chemInput} />}
              {s.mathInput && <MathExpression math={s.mathInput} />}
            </div>

            <span className="text-[10px] text-muted-foreground sm:w-44 shrink-0">{s.notes[locale]}</span>
          </div>
        ))}
      </div>

      <div className="rounded bg-emerald-500/10 p-2">
        <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
          {locale === "es"
            ? "✓ Todos los renders usan el mismo pipeline: ChemicalFormula (mhchem) + MathExpression (KaTeX). Sin duplicación de lógica de render."
            : "✓ All renders use the same pipeline: ChemicalFormula (mhchem) + MathExpression (KaTeX). No render logic duplication."}
        </p>
      </div>
    </div>
  )
}
