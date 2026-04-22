import { useMemo } from "react"
import { REFERENCE_CASES } from "../data/reference-cases"
import { validateAll } from "../engine/validator"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function ValidationMatrix({ locale }: Props) {
  const abCases = useMemo(() => REFERENCE_CASES.filter((c) => c.domain === "acid-base"), [])
  const results = useMemo(() => validateAll(abCases), [abCases])

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Matriz de validación cruzada: cada módulo se compara contra fuentes bibliográficas con tolerancias numéricas y tests de regresión."
          : "Cross-validation matrix: each module is compared against bibliographic sources with numerical tolerances and regression tests."}
      </p>
      <div className="flex gap-3 text-sm">
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-mono">
          ✓ {results.passed}
        </span>
        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-rose-600 dark:text-rose-400 font-mono">
          ✗ {results.failed}
        </span>
        <span className="text-muted-foreground">/ {results.total} {locale === "es" ? "tests" : "tests"}</span>
      </div>
      <div className="max-h-[350px] overflow-auto rounded border border-border/30">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left">
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Caso" : "Case"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Parámetro" : "Parameter"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Esperado" : "Expected"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Calculado" : "Calculated"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Error %" : "Error %"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Estado" : "Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {results.results.map((r, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="px-2 py-1 text-foreground">{r.caseId}</td>
                <td className="px-2 py-1 font-mono">{r.parameter}</td>
                <td className="px-2 py-1 font-mono">{r.expected.toFixed(4)}</td>
                <td className="px-2 py-1 font-mono">{r.actual.toFixed(4)}</td>
                <td className="px-2 py-1 font-mono">{r.errorPercent.toFixed(2)}%</td>
                <td className="px-2 py-1">
                  <span className={r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {r.passed ? "✓ PASS" : "✗ FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded border border-border/30 bg-muted/20 p-3 text-[10px] text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">{locale === "es" ? "Criterios de tolerancia" : "Tolerance criteria"}</p>
        <p>α {locale === "es" ? "fracciones" : "fractions"}: ±0.01 ({locale === "es" ? "absoluto" : "absolute"})</p>
        <p>{locale === "es" ? "Volúmenes de titulación" : "Titration volumes"}: ±2 mL ({locale === "es" ? "absoluto" : "absolute"})</p>
        <p>log K: ±0.1 ({locale === "es" ? "para constantes tabuladas" : "for tabulated constants"})</p>
      </div>
    </div>
  )
}
